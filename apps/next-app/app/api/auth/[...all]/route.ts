import { auth } from "@libs/auth";

function isConnRefusedToDatabase(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const anyError = error as any;

  if (anyError.code === "ECONNREFUSED") return true;

  // better-auth may surface AggregateError with underlying causes
  if (anyError?.name === "AggregateError" && Array.isArray(anyError?.errors)) {
    return anyError.errors.some((e: any) => e?.code === "ECONNREFUSED");
  }

  return false;
}

async function handle(request: Request) {
  try {
    return await auth.handler(request);
  } catch (error) {
    if (isConnRefusedToDatabase(error)) {
      return Response.json(
        {
          error: "DATABASE_UNAVAILABLE",
          message:
            "Database connection refused. Start Postgres and verify DATABASE_URL (e.g. postgresql://postgres:postgres@localhost:5432/tinyship).",
        },
        { status: 503 }
      );
    }
    throw error;
  }
}

export const GET = handle;
export const POST = handle;
