import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/v1\/?$/, "");

const EVOLINK_BASE_URL = normalizeBaseUrl(process.env.EVOLINK_BASE_URL || "https://api.evolink.ai");
const MODEL_OPTIONS = ["z-image-turbo", "nano-banana-2-lite", "gemini-3-pro-image-preview"] as const;
const SIZE_OPTIONS = ["auto", "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"] as const;
const QUALITY_OPTIONS = ["1K", "2K", "4K"] as const;
const MAX_REFERENCE_IMAGES = 5;
const UPSTREAM_TIMEOUT_MS = 20_000;
const UPSTREAM_RETRIES = 1;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const retryableNetworkErrorCodes = new Set([
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "ECONNRESET",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ENOTFOUND",
  "ECONNREFUSED",
  "ENETUNREACH",
]);

const getNetworkErrorCode = (error: unknown) => {
  const code = (error as any)?.cause?.code ?? (error as any)?.code;
  return typeof code === "string" ? code : null;
};

const fetchWithRetry = async (url: string, init: RequestInit, retries: number) => {
  const idempotencyKey = randomUUID();
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          "Idempotency-Key": idempotencyKey,
        },
        signal: controller.signal,
      });
      (response as any).__attempts = attempt + 1;
      return response;
    } catch (error) {
      lastError = error;
      const code = getNetworkErrorCode(error);
      const isTimeout = (error as any)?.name === "AbortError";
      const shouldRetry = attempt < retries && (isTimeout || (code ? retryableNetworkErrorCodes.has(code) : false));
      if (!shouldRetry) break;
      await sleep(250 * (attempt + 1));
    } finally {
      clearTimeout(timeout);
      attempt += 1;
    }
  }

  (lastError as any).__attempts = attempt;
  throw lastError;
};

const requestSchema = z.object({
  model: z.enum(MODEL_OPTIONS).default("z-image-turbo"),
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .min(5, "Prompt must be at least 5 characters")
    .max(2000, "Prompt must be less than 2000 characters"),
  size: z
    .string()
    .optional()
    .default("auto")
    .transform((value) => normalizeSize(value)),
  quality: z.enum(QUALITY_OPTIONS).optional().default("2K"),
  referenceUrls: z
    .array(z.string().url("Reference images must be valid URLs"))
    .max(MAX_REFERENCE_IMAGES)
    .optional(),
});

const normalizeStatus = (status?: string | null) => {
  const value = status?.toLowerCase();
  if (!value) return "submitted";
  if (["completed", "succeeded", "success", "done"].includes(value)) return "completed";
  if (["failed", "error", "canceled", "cancelled"].includes(value)) return "failed";
  return value;
};

const normalizeSize = (size: string) => {
  return SIZE_OPTIONS.includes(size as (typeof SIZE_OPTIONS)[number]) ? size : "auto";
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const baseUrl = EVOLINK_BASE_URL;
    const apiKey = process.env.EVOLINK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Evolink API key" },
        { status: 500 },
      );
    }

    const upstreamModel = parsed.data.model;
    const prompt = parsed.data.prompt.trim();

    const payload: Record<string, unknown> = {
      model: upstreamModel,
      prompt,
      size: normalizeSize(parsed.data.size),
      n: 1,
    };

    if (parsed.data.referenceUrls?.length) {
      payload.image_urls = parsed.data.referenceUrls;
    }

    if (upstreamModel !== "z-image-turbo") {
      payload.quality = parsed.data.quality;
    }

    const endpoint = `${baseUrl}/v1/images/generations`;
    let response: Response;

    try {
      response = await fetchWithRetry(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        },
        UPSTREAM_RETRIES,
      );
    } catch (error) {
      console.error("Upstream fetch failed:", { vendor: "evolink", endpoint, model: upstreamModel, error });
      const isProd = process.env.NODE_ENV === "production";
      const cause = (error as any)?.cause;
      const attempts = (error as any)?.__attempts;
      const details = isProd
        ? undefined
        : {
            vendor: "evolink",
            endpoint,
            model: upstreamModel,
            message: error instanceof Error ? error.message : String(error),
            attempts: typeof attempts === "number" ? attempts : undefined,
            cause:
              cause && typeof cause === "object"
                ? {
                    name: (cause as any).name,
                    message: (cause as any).message,
                    code: (cause as any).code,
                    errno: (cause as any).errno,
                    syscall: (cause as any).syscall,
                    address: (cause as any).address,
                    port: (cause as any).port,
                  }
                : cause ?? null,
          };

      return NextResponse.json(
        {
          error: "Upstream fetch failed",
          ...(details ? { details } : {}),
        },
        { status: 502 },
      );
    }

    const rawText = await response.text();
    let data: any = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = rawText;
    }

    const isErrorCode = typeof data?.code === "number" && data.code !== 200;

    if (!response.ok || isErrorCode) {
      console.error("Failed to create Nano Banana generation task:", data);
      return NextResponse.json(
        {
          error: data.error?.message || data?.message || "Failed to create Nano Banana task",
          details: data,
        },
        { status: response.ok ? 400 : response.status },
      );
    }

    const body = Array.isArray(data?.data) ? data.data[0] : data?.data ?? data;

    return NextResponse.json({
      taskId: body?.task_id ?? body?.id ?? null,
      status: normalizeStatus(body?.status),
      progress: body?.progress ?? 0,
      estimatedTime: body?.estimated_time ?? null,
    });
  } catch (error) {
    console.error("Unexpected Nano Banana generation error:", error);
    const isProd = process.env.NODE_ENV === "production";
    const details = isProd
      ? undefined
      : error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error) };

    return NextResponse.json(
      { error: "Unexpected server error", ...(details ? { details } : {}) },
      { status: 500 },
    );
  }
}
