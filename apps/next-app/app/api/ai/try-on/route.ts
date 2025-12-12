import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

const EVOLINK_API_BASE = "https://api.evolink.ai";
const MODEL_NAME = "z-image-turbo";
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB per upload
const BACKGROUND_MODES = new Set(["preserve", "studio", "street", "custom"]);

type TryOnJobFields = {
  backgroundMode: string;
  fitTightness: number;
  preserveAccessories: boolean;
  notes: string;
};

const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

const parseNumberField = (value: FormDataEntryValue | null, fallback: number, min: number, max: number) => {
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  return clamp(Number.isFinite(parsed) ? parsed : fallback, min, max);
};

const buildPrompt = (fields: TryOnJobFields) => {
  const backgroundDirective =
    fields.backgroundMode === "preserve"
      ? "Do not alter the background, lighting, shadows, or scene composition."
      : fields.backgroundMode === "studio"
        ? "If needed, subtly adjust background into a neutral studio sweep while keeping the model anchored and unchanged."
        : fields.backgroundMode === "street"
          ? "Allow light street-style context tweaks (subtle depth of field, urban hints) while keeping the model consistent."
          : "Keep the background cohesive with the new outfit but do not replace the overall scene or framing.";

  const accessoriesDirective = fields.preserveAccessories
    ? "Keep jewelry, hair, makeup, hands, and handheld props exactly as in the model reference."
    : "Accessories may be adapted to match the transferred outfit, but never change the face or hair.";

  const fitDirective =
    fields.fitTightness > 70
      ? "Fit the garment close to the body, following the drape of the reference apparel without reshaping the body."
      : fields.fitTightness < 40
        ? "Allow a relaxed silhouette similar to the garment reference, keeping the same body proportions."
        : "Maintain a natural tailored fit between the two references without altering anatomy.";

  const notesDirective = fields.notes ? `Art director notes: ${fields.notes}.` : "";

  const identityDirective =
    "Use the model reference as the only source of identity. Do not change the person's face, hairline, skin tone, age, expression, body proportions, hands, pose, framing, or camera angle.";

  const garmentDirective =
    "Transfer only the garment from the garment reference—fabric, silhouette, neckline, sleeves, and closures—onto the model without introducing new artifacts. Ignore any people in the garment reference; if there is a conflict, keep the model identity unchanged and adapt the clothing instead.";

  return [
    "You are a virtual fitting specialist.",
    identityDirective,
    garmentDirective,
    "Preserve the model's identity, pose, proportions, and camera perspective exactly.",
    "Ensure seams, closures, and drape follow the garment reference without artifacts.",
    accessoriesDirective,
    backgroundDirective,
    fitDirective,
    notesDirective,
  ]
    .filter(Boolean)
    .join(" ");
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.EVOLINK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing Evolink API key" }, { status: 500 });
    }

    const formData = await request.formData();
    const modelImage = formData.get("modelImage");
    const garmentImage = formData.get("garmentImage");

    if (!(modelImage instanceof File)) {
      return NextResponse.json({ error: "Model image is required" }, { status: 400 });
    }

    if (!(garmentImage instanceof File)) {
      return NextResponse.json({ error: "Garment reference is required" }, { status: 400 });
    }

    const files = [modelImage, garmentImage];
    for (const file of files) {
      if (!file.type?.startsWith("image/")) {
        return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 });
      }

      if (file.size <= 0) {
        return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Image must be 15MB or smaller" }, { status: 400 });
      }
    }

    const backgroundModeRaw = formData.get("backgroundMode");
    const backgroundMode = typeof backgroundModeRaw === "string" && BACKGROUND_MODES.has(backgroundModeRaw)
      ? backgroundModeRaw
      : "preserve";

    const fitTightness = parseNumberField(formData.get("fitTightness"), 60, 10, 100);
    const preserveAccessories = formData.get("preserveAccessories") !== "false";
    const notes = (formData.get("notes")?.toString() ?? "").trim();

    const jobFields: TryOnJobFields = {
      backgroundMode,
      fitTightness,
      preserveAccessories,
      notes,
    };

    const modelBuffer = Buffer.from(await modelImage.arrayBuffer());
    const garmentBuffer = Buffer.from(await garmentImage.arrayBuffer());

    const payload: Record<string, unknown> = {
      model: MODEL_NAME,
      prompt: buildPrompt(jobFields),
      size: "3:4",
      nsfw_check: false,
      reference_image_base64: modelBuffer.toString("base64"),
      reference_image_mime: modelImage.type,
      garment_reference_base64: garmentBuffer.toString("base64"),
      garment_reference_mime: garmentImage.type,
      preserve_identity: true,
      preserve_background: backgroundMode === "preserve",
      fit_tightness: Number((fitTightness / 100).toFixed(2)),
    };

    if (backgroundMode !== "preserve") {
      payload.background_mode = backgroundMode;
    }

    if (notes) {
      payload.notes = notes;
    }

    if (!preserveAccessories) {
      payload.adapt_accessories = true;
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
      console.error("Failed to start try-on render:", data);
      return NextResponse.json(
        {
          error: data.error?.message || "Failed to start try-on task",
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
    console.error("Unexpected try-on error:", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
