import { NextResponse } from "next/server";
import { z } from "zod";

const EVOLINK_API_BASE = "https://api.evolink.ai";
const MODEL_NAME = "z-image-turbo";
const SIZE_OPTIONS = [
  "1:1",
  "2:3",
  "3:2",
  "3:4",
  "4:3",
  "9:16",
  "16:9",
  "1:2",
  "2:1",
] as const;

const requestSchema = z.object({
  prompt: z
    .string({
      required_error: "Prompt is required",
    })
    .trim()
    .min(5, "Prompt must be at least 5 characters")
    .max(2000, "Prompt must be less than 2000 characters"),
  size: z.enum(SIZE_OPTIONS).optional().default("3:4"),
  seed: z
    .number()
    .int()
    .min(1)
    .max(2147483647)
    .optional(),
});

export async function POST(request: Request) {
  try {
    const apiKey = process.env.EVOLINK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Missing Evolink API key",
        },
        { status: 500 },
      );
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
      model: MODEL_NAME,
      prompt: parsed.data.prompt,
      size: parsed.data.size,
      nsfw_check: false,
    };

    if (parsed.data.seed) {
      payload.seed = parsed.data.seed;
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
      console.error("Failed to create image generation task:", data);
      return NextResponse.json(
        {
          error: data.error?.message || "Failed to create image generation task",
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
    console.error("Unexpected image generation error:", error);
    return NextResponse.json(
      {
        error: "Unexpected server error",
      },
      { status: 500 },
    );
  }
}
