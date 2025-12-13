import { NextResponse } from "next/server";

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/v1\/?$/, "");

const EVOLINK_BASE_URL = normalizeBaseUrl(process.env.EVOLINK_BASE_URL || "https://api.evolink.ai");
const MODEL_NAME = "gemini-3-pro-image-preview";
const SINGLE_SENTENCE_PROMPT =
  "Take the person from photo 1 and put on the exact outfit from photo 2, keeping the identity and pose unchanged.";
const ALLOWED_SIZES = new Set(["1:1", "2:3", "3:2"]);

const normalizeStatus = (status?: string | null) => {
  const value = status?.toLowerCase();
  if (!value) return "submitted";
  if (["completed", "succeeded", "success", "done"].includes(value)) return "completed";
  if (["failed", "error", "canceled", "cancelled"].includes(value)) return "failed";
  return value;
};

const normalizeSize = (size: string) => (ALLOWED_SIZES.has(size) ? size : "2:3");

export async function POST(request: Request) {
  try {
    const apiKey = process.env.EVOLINK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing Evolink API key" }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    const modelUrl: string | undefined = body?.modelUrl;
    const garmentUrl: string | undefined = body?.garmentUrl;
    const prompt: string = (body?.prompt || SINGLE_SENTENCE_PROMPT).toString();
    const size: string = (body?.size || "3:4").toString();

    if (!modelUrl || !garmentUrl) {
      return NextResponse.json({ error: "Model and garment URLs are required" }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      model: MODEL_NAME,
      prompt,
      size: normalizeSize(size),
      n: 1,
      image_urls: [modelUrl, garmentUrl],
      nsfw_check: false,
    };

    const response = await fetch(`${EVOLINK_BASE_URL}/v1/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    const isErrorCode = typeof data?.code === "number" && data.code !== 200;

    if (!response.ok || isErrorCode) {
      console.error("Failed to start try-on render:", data);
      return NextResponse.json(
        {
          error: data.error?.message || data?.message || "Failed to start try-on task",
          details: data,
        },
        { status: response.ok ? 400 : response.status },
      );
    }

    const bodyData = Array.isArray(data?.data) ? data.data[0] : data?.data ?? data;

    return NextResponse.json({
      taskId: bodyData?.task_id ?? bodyData?.id ?? null,
      status: normalizeStatus(bodyData?.status),
      progress: bodyData?.progress ?? 0,
      estimatedTime: bodyData?.estimated_time ?? null,
    });
  } catch (error) {
    console.error("Unexpected try-on error:", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
