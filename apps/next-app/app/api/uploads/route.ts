import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createOssClient } from "@/lib/oss";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per Evolink requirements
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(file.type.toLowerCase())) {
      return NextResponse.json({ error: "Only JPG/PNG/WebP images are supported" }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be 10MB or smaller" }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const objectKey = `nano-banana/${randomUUID()}.${ext}`;

    const client = createOssClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await client.put(objectKey, buffer, {
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!result.url) {
      return NextResponse.json({ error: "Failed to upload to OSS" }, { status: 500 });
    }

    const publicUrl = result.url.startsWith("http") ? result.url : `https://${result.url}`;

    return NextResponse.json({
      url: publicUrl,
      objectKey,
    });
  } catch (error) {
    console.error("OSS upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
