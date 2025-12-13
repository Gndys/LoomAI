import { NextResponse } from "next/server";

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/v1\/?$/, "");

const EVOLINK_BASE_URL = normalizeBaseUrl(process.env.EVOLINK_BASE_URL || "https://api.evolink.ai");

const normalizeStatus = (status?: string | null) => {
  const value = status?.toLowerCase();
  if (!value) return "submitted";
  if (["completed", "succeeded", "success", "done"].includes(value)) return "completed";
  if (["failed", "error", "canceled", "cancelled"].includes(value)) return "failed";
  return value;
};

const isLikelyImageUrl = (value: string) => {
  if (/^data:image\//i.test(value)) return true;
  if (!/^https?:\/\//i.test(value)) return false;
  if (/\.(png|jpe?g|webp)(\?|#|$)/i.test(value)) return true;
  if (/cdn\.apimart\.(ai|com)\b/i.test(value)) return true;
  if (/cdn\.evolink\.(ai|cn)\b/i.test(value)) return true;
  if (/\/files\//i.test(value)) return true;
  return /image_task_/i.test(value);
};

const extractFirstUrl = (value: unknown, seen: Set<unknown>, depth = 0): string | null => {
  if (depth > 10 || value == null) return null;
  if (typeof value === "string") return isLikelyImageUrl(value) ? value : null;
  if (typeof value !== "object") return null;
  if (seen.has(value)) return null;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = extractFirstUrl(item, seen, depth + 1);
      if (url) return url;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  for (const key of ["image_url", "imageUrl", "url", "href", "src"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && isLikelyImageUrl(candidate)) return candidate;
  }

  for (const key of [
    "results",
    "result",
    "output",
    "outputs",
    "images",
    "image_urls",
    "urls",
    "data",
    "task_info",
  ]) {
    const url = extractFirstUrl(record[key], seen, depth + 1);
    if (url) return url;
  }

  return null;
};

const buildTaskResponse = (raw: any, taskId: string) => {
  const resultsCandidate =
    raw?.results ??
    raw?.result ??
    raw?.output ??
    raw?.outputs ??
    raw?.images ??
    raw?.image_urls ??
    raw?.urls ??
    raw?.task_info?.result ??
    raw?.task_info?.results ??
    raw?.task_info?.output ??
    raw?.task_info?.outputs ??
    raw?.data;

  const results = Array.isArray(resultsCandidate)
    ? resultsCandidate
    : resultsCandidate
      ? [resultsCandidate]
      : [];

  const imageUrl = extractFirstUrl(raw ?? resultsCandidate, new Set()) ?? null;
  const statusCandidate =
    raw?.status ??
    raw?.task_status ??
    raw?.taskStatus ??
    raw?.task_info?.status ??
    raw?.task_info?.task_status ??
    raw?.task_info?.taskStatus ??
    raw?.task_info?.task_state ??
    raw?.task_info?.state;

  return {
    taskId: raw?.task_id ?? raw?.id ?? taskId,
    status: normalizeStatus(typeof statusCandidate === "string" ? statusCandidate : statusCandidate?.toString?.()),
    progress: raw?.progress ?? raw?.task_progress ?? raw?.task_info?.progress ?? 0,
    results,
    imageUrl,
    model: raw?.model,
    canCancel: Boolean(raw?.task_info?.can_cancel),
    type: raw?.type ?? "image_generation",
  };
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        {
          error: "Task ID is required",
        },
        { status: 400 },
      );
    }

    const candidateUpstreams = [
      {
        name: "evolink",
        baseUrl: EVOLINK_BASE_URL,
        apiKey: process.env.EVOLINK_API_KEY,
        paths: (taskIdValue: string, baseUrl: string) => [
          `${baseUrl}/v1/tasks/${taskIdValue}`,
        ],
      },
    ].filter((item) => Boolean(item.apiKey));

    if (candidateUpstreams.length === 0) {
      return NextResponse.json(
        {
          error: "Missing Evolink API key",
          details: {
            required: ["EVOLINK_API_KEY"],
          },
        },
        { status: 500 },
      );
    }

    let lastError: any = null;
    let bestCandidate: ReturnType<typeof buildTaskResponse> | null = null;
    let bestScore = -1;

    const scoreCandidate = (candidate: ReturnType<typeof buildTaskResponse>) => {
      let score = 0;
      if (candidate.status === "completed") score += 1000;
      if (candidate.imageUrl) score += 500;
      const progressValue = typeof candidate.progress === "number" ? candidate.progress : Number(candidate.progress);
      if (Number.isFinite(progressValue)) score += Math.min(Math.max(progressValue, 0), 100);
      return score;
    };

    for (const upstream of candidateUpstreams) {
      for (const url of upstream.paths(taskId, upstream.baseUrl)) {
        try {
          const response = await fetch(url, {
            method: "GET",
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${upstream.apiKey}`,
              "Content-Type": "application/json",
            },
          });

          const rawText = await response.text();
          let data: any = null;
          try {
            data = rawText ? JSON.parse(rawText) : null;
          } catch {
            data = rawText;
          }
          const isErrorCode = typeof data?.code === "number" && data.code !== 200;

          if (!response.ok || isErrorCode) {
            lastError = { upstream: upstream.name, url, data };
            continue;
          }

          const body = Array.isArray(data?.data) ? data.data[0] : data?.data ?? data;
          const candidate = buildTaskResponse(body, taskId);

          if (candidate.status === "completed" && candidate.imageUrl) {
            return NextResponse.json(candidate);
          }

          const candidateScore = scoreCandidate(candidate);
          if (candidateScore > bestScore) {
            bestScore = candidateScore;
            bestCandidate = candidate;
          }
        } catch (error) {
          lastError = { upstream: upstream.name, url, error };
          continue;
        }
      }
    }

    if (bestCandidate) {
      return NextResponse.json(bestCandidate);
    }

    console.error("Failed to fetch task status:", lastError);
    return NextResponse.json(
      {
        error: "Failed to fetch task status",
        details: lastError ?? null,
      },
      { status: 502 },
    );
  } catch (error) {
    console.error("Unexpected task polling error:", error);
    return NextResponse.json(
      {
        error: "Unexpected server error",
      },
      { status: 500 },
    );
  }
}
