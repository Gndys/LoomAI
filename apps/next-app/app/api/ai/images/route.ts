import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { z } from "zod";

const EVOLINK_API_BASE = "https://api.evolink.ai";
const MODEL_TEXT_IMAGE = "z-image-turbo";
const MODEL_FUSION = "nano-banana-2-lite";
const SIZE_OPTIONS = [
  "auto",
  "1:1",
  "2:3",
  "3:2",
  "3:4",
  "4:3",
  "4:5",
  "5:4",
  "9:16",
  "16:9",
  "21:9",
] as const;
const MAX_REFERENCE_IMAGES = 5;
const MAX_REFERENCE_BYTES = 10 * 1024 * 1024; // 10 MB per image as per Evolink docs
const SUPPORTED_REFERENCE_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const DEFAULT_FUSION_DIRECTIVE =
  "Take the person from the model reference (Photo 1) and dress them in the exact garment from the garment reference (Photo 2) with no other alterations. Preserve faces, poses, proportions, and camera framing exactly while copying the garment fabric, colors, prints, trims, and construction one-to-one.";

const requestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .min(5, "Prompt must be at least 5 characters")
    .max(2000, "Prompt must be less than 2000 characters"),
  size: z.enum(SIZE_OPTIONS).optional().default("3:4"),
  seed: z
    .number()
    .int()
    .min(1)
    .max(2147483647)
    .optional(),
  references: z
    .array(
      z.object({
        dataUrl: z
          .string()
          .regex(/^data:image\/[a-zA-Z+.-]+;base64,[A-Za-z0-9+/=]+$/, "Invalid image data"),
        mimeType: z
          .string()
          .regex(/^image\//, "Invalid MIME type"),
        size: z.number().int().positive().max(MAX_REFERENCE_BYTES).optional(),
      }),
    )
    .max(MAX_REFERENCE_IMAGES)
    .optional(),
});

const extractBase64Payload = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(?<mime>[^;]+);base64,(?<data>.+)$/);
  if (!match?.groups?.data) {
    throw new Error("Invalid data URL");
  }
  return {
    mime: match.groups.mime,
    data: match.groups.data,
  };
};

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

    const hasReferences = Boolean(parsed.data.references?.length);
    const model = hasReferences ? MODEL_FUSION : MODEL_TEXT_IMAGE;

    const payload: Record<string, unknown> = {
      model,
      prompt:
        hasReferences && parsed.data.prompt
          ? `${DEFAULT_FUSION_DIRECTIVE} ${parsed.data.prompt}`.trim()
          : hasReferences
            ? DEFAULT_FUSION_DIRECTIVE
            : parsed.data.prompt,
      size: parsed.data.size,
      nsfw_check: false,
    };

    if (parsed.data.seed) {
      payload.seed = parsed.data.seed;
    }

    if (parsed.data.references?.length) {
      const sanitizedReferences: string[] = [];
      for (const reference of parsed.data.references) {
        if (!SUPPORTED_REFERENCE_MIME.has(reference.mimeType.toLowerCase())) {
          return NextResponse.json(
            { error: "Unsupported reference image format" },
            { status: 400 },
          );
        }

        const { data, mime } = extractBase64Payload(reference.dataUrl);
        const bufferLength = Buffer.from(data, "base64").length;

        if (bufferLength > MAX_REFERENCE_BYTES) {
          return NextResponse.json(
            { error: "Reference image must be 10MB or smaller" },
            { status: 400 },
          );
        }

        if (mime !== reference.mimeType) {
          return NextResponse.json(
            { error: "Reference image metadata mismatch" },
            { status: 400 },
          );
        }

        sanitizedReferences.push(`data:${mime};base64,${data}`);
      }

      payload.image_urls = sanitizedReferences;
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
