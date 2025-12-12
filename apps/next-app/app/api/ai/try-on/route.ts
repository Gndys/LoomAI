import { NextResponse } from "next/server";

const EVOLINK_API_BASE = "https://api.evolink.ai";
const MODEL_NAME = "gemini-3-pro-image-preview";
const SINGLE_SENTENCE_PROMPT =
  "Take the person from photo 1 and put on the exact outfit from photo 2, keeping the identity and pose unchanged.";

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
      size,
      nsfw_check: false,
      image_urls: [modelUrl, garmentUrl],
    };

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
