import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const API_ENDPOINT = "https://api.apimart.ai/v1/responses";
const SYSTEM_PROMPT =
  "You are a prompt extractor for text-to-image models. Read the image and return a concise, comma-separated prompt covering subject, outfit/material cues, background, lighting, camera framing, and mood. Keep it actionable for generation.";
const MAX_OUTPUT_TOKENS = 768;

function extractPromptFromResponse(body: any): string | null {
  const getString = (value: any) => (typeof value === "string" ? value.trim() : "");
  const extractFromParts = (parts: any[]): string =>
    parts
      .map((part: any) => {
        if (typeof part === "string") return part;
        const direct =
          getString(part?.output_text) ||
          getString(part?.text) ||
          getString(part?.content);
        if (direct) return direct;
        if (Array.isArray(part?.content)) return extractFromParts(part.content);
        if (Array.isArray(part?.message?.content)) {
          return extractFromParts(part.message.content);
        }
        const messageContent = getString(part?.message?.content);
        if (messageContent) return messageContent;
        return "";
      })
      .filter(Boolean)
      .join(" ")
      .trim();

  if (typeof body === "string") {
    return getString(body) || null;
  }

  if (Array.isArray(body)) {
    const merged = extractFromParts(body);
    if (merged) return merged;
  }

  const extractFromOutput = (output: any): string | null => {
    if (!output) return null;

    if (typeof output === "string") {
      const normalized = getString(output);
      return normalized || null;
    }

    if (Array.isArray(output)) {
      const merged = extractFromParts(output);
      return merged || null;
    }

    if (typeof output === "object") {
      const direct =
        getString(output?.output_text) ||
        getString(output?.text) ||
        getString(output?.content) ||
        getString(output?.message?.content);
      if (direct) return direct;

      if (Array.isArray(output?.content)) {
        const merged = extractFromParts(output.content);
        if (merged) return merged;
      }

      if (Array.isArray(output?.message?.content)) {
        const merged = extractFromParts(output.message.content);
        if (merged) return merged;
      }

      if (Array.isArray(output?.data)) {
        const merged = extractFromParts(output.data);
        if (merged) return merged;
      }
    }

    return null;
  };

  const direct =
    getString(body?.output_text) ||
    getString(body?.text) ||
    getString(body?.content) ||
    getString(body?.result);
  if (direct) return direct;

  const outputCandidates = [
    body?.output,
    body?.data?.output,
    body?.response?.output,
    body?.data?.response?.output,
  ];
  for (const candidate of outputCandidates) {
    const merged = extractFromOutput(candidate);
    if (merged) return merged;
  }

  const choices = body?.choices ?? body?.data?.choices ?? body?.response?.choices ?? body?.data?.response?.choices;
  const choiceContent = choices?.[0]?.message?.content ?? choices?.[0]?.content;
  const choiceMerged = extractFromOutput(choiceContent);
  if (choiceMerged) return choiceMerged;

  const messageMerged = extractFromOutput(body?.message?.content);
  if (messageMerged) return messageMerged;

  const responseMessageMerged = extractFromOutput(body?.response?.message?.content);
  if (responseMessageMerged) return responseMessageMerged;

  const nestedDataMerged = extractFromOutput(body?.data);
  if (nestedDataMerged) return nestedDataMerged;

  return null;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.APIMART_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing APIMART_API_KEY" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const hints = (formData.get("hints") as string | null)?.toString().trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME.has(mimeType)) {
      return NextResponse.json({ error: "Only JPG/PNG/WebP images are supported" }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "Image file is empty" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be 10MB or smaller" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const userInstruction = [
      "请拆解这张图片，生成可用于AI绘图的提示词，包含主体、服装/材质、背景、光线、镜头与氛围，用逗号分隔，控制在80-120个汉字或英文单词以内。",
      hints ? `额外要求：${hints}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const payload = {
      model: "gpt-5-nano",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: SYSTEM_PROMPT }],
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: userInstruction },
            { type: "input_image", image_url: dataUrl },
          ],
        },
      ],
      reasoning: { effort: "low" }, // reduce reasoning tokens consumption
      max_output_tokens: MAX_OUTPUT_TOKENS,
    };

    const response = await fetch(API_ENDPOINT, {
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
      const message =
        data?.error?.message ||
        data?.message ||
        data?.msg ||
        "Failed to extract prompt from APIMart";
      return NextResponse.json(
        { error: message, details: data },
        { status: response.ok ? 400 : response.status },
      );
    }

    const body = data?.data ?? data;

    if (body?.status === "incomplete") {
      const reason = body?.incomplete_details?.reason || "unknown";
      return NextResponse.json(
        { error: `APIMart response incomplete: ${reason}`, details: body },
        { status: 502 },
      );
    }

    const prompt = extractPromptFromResponse(body);

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt returned from APIMart response", details: body },
        { status: 502 },
      );
    }

    return NextResponse.json({
      prompt,
      usage: body?.usage ?? null,
      model: body?.model ?? "gpt-5-nano",
    });
  } catch (error) {
    console.error("Prompt extractor error:", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
