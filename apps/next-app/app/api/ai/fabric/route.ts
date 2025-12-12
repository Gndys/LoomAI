import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

const EVOLINK_API_BASE = "https://api.evolink.ai";
const MODEL_NAME = "z-image-turbo";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const FABRIC_PRESETS = {
  silk: {
    label: "Liquid silk",
    prompt: "high-sheen silk charmeuse, fluid drape, soft highlights, minimal grain, luxury finish",
  },
  denim: {
    label: "Deep indigo denim",
    prompt: "rigid 12oz denim, visible twill weave, matte texture, structured seams",
  },
  knit: {
    label: "Fine gauge knit",
    prompt: "breathable knitwear, subtle ribbing, soft yarn detail, tactile stitch definition",
  },
} as const;

const FABRIC_TYPES = Object.keys(FABRIC_PRESETS) as Array<keyof typeof FABRIC_PRESETS>;
type PresetFabric = keyof typeof FABRIC_PRESETS;
type FabricType = PresetFabric | "custom";

type FabricJobFields = {
  fabricType: FabricType;
  fabricLabel: string;
  patternPrompt: string;
  advancedPrompt: string;
  textureStrength: number;
  patternScale: number;
  lockModel: boolean;
  preserveBackground: boolean;
};

const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

const parseNumberField = (value: FormDataEntryValue | null, fallback: number, min: number, max: number) => {
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  return clampNumber(Number.isFinite(parsed) ? parsed : fallback, min, max);
};

const buildPrompt = (fields: FabricJobFields) => {
  const preset = fields.fabricType === "custom" ? null : FABRIC_PRESETS[fields.fabricType];
  const fabricDescriptor = fields.fabricLabel || preset?.label || "textile";
  const textureHint = preset?.prompt ?? fields.patternPrompt;

  const segments = [
    `Preserve the exact person, pose, proportions, and styling from the reference photo.`,
    `Keep the original garment category and silhouette identical: neckline/collar shape, placket, pocket placement, hem length, sleeve length, and fit must match the reference.`,
    `Do not add or remove closures (buttons/zip), seams, or trims unless explicitly described. Do not turn sweaters into shirts or jackets, and do not change the garment type.`,
    fields.preserveBackground
      ? "Keep the background, lighting, and accessories untouched unless they clip with the garment."
      : "Allow subtle background adjustments that reinforce the new fabric.",
    fields.lockModel
      ? "Do not change facial identity, limbs, or camera placement."
      : "You may slightly adapt posing but keep the same character.",
    `Replace only the garment material with ${fabricDescriptor}. ${textureHint}`,
  ];

  if (fields.patternPrompt) {
    segments.push(`Apply this print or weave direction: ${fields.patternPrompt}.`);
  }

  if (fields.advancedPrompt) {
    segments.push(`Art direction notes: ${fields.advancedPrompt}.`);
  }

  segments.push(
    `Honor the existing seams and construction; do not hallucinate new trims unless explicitly described.`,
    `Ensure the fabric simulation stays consistent across the full garment.`,
  );

  return segments.join(" ");
  };

export async function POST(request: Request) {
  try {
    const apiKey = process.env.EVOLINK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing Evolink API key" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Reference image is required" }, { status: 400 });
    }

    if (!file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be smaller than 10MB" }, { status: 400 });
    }

    const fabricTypeRaw = formData.get("fabricType");
    if (typeof fabricTypeRaw !== "string") {
      return NextResponse.json({ error: "Fabric type is required" }, { status: 400 });
    }

    const isPresetType = (value: string): value is PresetFabric => FABRIC_TYPES.includes(value as PresetFabric);

    if (!isPresetType(fabricTypeRaw) && fabricTypeRaw !== "custom") {
      return NextResponse.json({ error: "Unsupported fabric type" }, { status: 400 });
    }

    const fabricLabelRaw = formData.get("fabricLabel");
    const fabricLabel = typeof fabricLabelRaw === "string" && fabricLabelRaw.trim().length > 0
      ? fabricLabelRaw.trim()
      : fabricTypeRaw === "custom"
        ? "Custom fabric"
        : FABRIC_PRESETS[fabricTypeRaw as PresetFabric].label;

    if (fabricTypeRaw === "custom" && (!fabricLabel || fabricLabel === "Custom fabric")) {
      return NextResponse.json({ error: "Custom fabric label is required" }, { status: 400 });
    }

    const patternPrompt = (formData.get("patternPrompt")?.toString() ?? "").trim();
    const advancedPrompt = (formData.get("advancedPrompt")?.toString() ?? "").trim();
    const textureStrength = parseNumberField(formData.get("textureStrength"), 70, 10, 100) / 100;
    const patternScale = parseNumberField(formData.get("patternScale"), 100, 40, 200) / 100;
    const lockModel = formData.get("lockModel") === "true";
    const preserveBackground = formData.get("preserveBackground") !== "false";

    const jobFields: FabricJobFields = {
      fabricType: fabricTypeRaw,
      fabricLabel,
      patternPrompt,
      advancedPrompt,
      textureStrength: Number(textureStrength.toFixed(2)),
      patternScale: Number(patternScale.toFixed(2)),
      lockModel,
      preserveBackground,
    };

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const payload: Record<string, unknown> = {
      model: MODEL_NAME,
      prompt: buildPrompt(jobFields),
      size: "3:4",
      nsfw_check: false,
      reference_image_base64: base64Image,
      reference_image_mime: file.type,
      preserve_identity: jobFields.lockModel,
      preserve_background: jobFields.preserveBackground,
      fabric_texture_strength: jobFields.textureStrength,
      pattern_scale: jobFields.patternScale,
    };

    if (patternPrompt) {
      payload.pattern_prompt = patternPrompt;
    }

    if (advancedPrompt) {
      payload.notes = advancedPrompt;
    }

    if (jobFields.fabricType !== "custom") {
      payload.fabric_hint = FABRIC_PRESETS[jobFields.fabricType as PresetFabric].prompt;
    } else {
      payload.fabric_hint = fabricLabel;
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
      console.error("Failed to start fabric render:", data);
      return NextResponse.json(
        {
          error: data.error?.message || "Failed to start fabric design task",
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
    console.error("Unexpected fabric design error:", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
