import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { z } from "zod";

const EVOLINK_API_BASE = "https://api.evolink.ai";
const MODEL_OPTIONS = ["z-image-turbo", "nano-banana-2-lite", "gemini-3-pro-image-preview"] as const;
const SIZE_OPTIONS = ["auto", "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"] as const;
const QUALITY_OPTIONS = ["1K", "2K", "4K"] as const;
const MAX_REFERENCE_IMAGES = 5;

const requestSchema = z.object({
  model: z.enum(MODEL_OPTIONS).default("z-image-turbo"),
  prompt: z
    .string({ required_error: "Prompt is required" })
    .trim()
    .min(5, "Prompt must be at least 5 characters")
    .max(2000, "Prompt must be less than 2000 characters"),
  size: z.enum(SIZE_OPTIONS).optional().default("auto"),
  quality: z.enum(QUALITY_OPTIONS).optional().default("2K"),
  referenceUrls: z
    .array(z.string().url("Reference images must be valid URLs"))
    .max(MAX_REFERENCE_IMAGES)
    .optional(),
});

export async function POST(request: Request) {
  try {
    const apiKey = process.env.EVOLINK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing Evolink API key" }, { status: 500 });
    }

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

    const payload: Record<string, unknown> = {
      model: parsed.data.model,
      prompt: parsed.data.prompt,
      size: parsed.data.size,
      nsfw_check: false,
    };

    // Note: z-image-turbo does not accept quality; it only uses size
    if (parsed.data.model !== "z-image-turbo") {
      payload.quality = parsed.data.quality;
    }

    if (parsed.data.referenceUrls?.length) {
      payload.image_urls = parsed.data.referenceUrls;
    }

    const response = await fetch(`${EVOLINK_API_BASE}/v1/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to create Nano Banana generation task:", data);
      return NextResponse.json(
        {
          error: data.error?.message || "Failed to create Nano Banana task",
          details: data,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      taskId: data.id,
      status: data.status,
      progress: data.progress ?? 0,
      estimatedTime: data.task_info?.estimated_time ?? null,
    });
  } catch (error) {
    console.error("Unexpected Nano Banana generation error:", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
