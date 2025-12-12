import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const API_ENDPOINT = "https://api.apimart.ai/v1/responses";
const SYSTEM_PROMPT =
  "You are a prompt extractor for text-to-image models. Read the image and return a concise, comma-separated prompt covering subject, outfit/material cues, background, lighting, camera framing, and mood. Keep it actionable for generation.";

function extractPromptFromResponse(body: any): string | null {
  if (typeof body?.output_text === "string") {
    return body.output_text.trim();
  }

  if (Array.isArray(body?.output)) {
    const merged = body.output
      .map((item: any) => {
        if (typeof item?.text === "string") return item.text;
        if (typeof item?.content === "string") return item.content;
        if (Array.isArray(item?.content)) {
          return item.content
            .map((part: any) => {
              if (typeof part === "string") return part;
              if (typeof part?.text === "string") return part.text;
              return "";
            })
            .filter(Boolean)
            .join(" ");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n")
      .trim();

    if (merged) return merged;
  }

  const choiceContent = body?.choices?.[0]?.message?.content;
  if (typeof choiceContent === "string") {
    return choiceContent.trim();
  }

  if (Array.isArray(choiceContent)) {
    const merged = choiceContent
      .map((part: any) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .filter(Boolean)
      .join(" ")
      .trim();
    if (merged) return merged;
  }

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
      temperature: 0.35,
      top_p: 0.9,
      max_output_tokens: 320,
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
    const prompt = extractPromptFromResponse(body);

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt returned from APIMart response" },
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
