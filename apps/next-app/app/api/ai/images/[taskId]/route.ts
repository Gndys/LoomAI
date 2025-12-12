import { NextResponse } from "next/server";

const EVOLINK_API_BASE = "https://api.evolink.ai";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
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

    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        {
          error: "Task ID is required",
        },
        { status: 400 },
      );
    }

    const response = await fetch(`${EVOLINK_API_BASE}/v1/tasks/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch task status:", data);
      return NextResponse.json(
        {
          error: data.error?.message || "Failed to fetch task status",
          details: data,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      taskId: data.id,
      status: data.status,
      progress: data.progress ?? 0,
      results: data.results ?? [],
      imageUrl: Array.isArray(data.results) ? data.results[0] ?? null : null,
      model: data.model,
      canCancel: data.task_info?.can_cancel ?? false,
      type: data.type,
    });
  } catch (error) {
    console.error("Unexpected task polling error:", error);
    return NextResponse.json(
      {
        error: "Unexpected server error",
      },
      { status: 500 },
    );
  }
}
