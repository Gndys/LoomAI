type MaybeApiError = {
  code?: string;
  message?: string;
  statusCode?: number;
  body?: unknown;
};

type ApiErrorBody = {
  error?: string;
  message?: string;
};

export function normalizeAuthError(error: unknown): {
  code: string;
  message: string;
  statusCode?: number;
} | null {
  if (!error || typeof error !== "object") return null;

  const anyError = error as MaybeApiError;
  const body = (anyError.body ?? null) as ApiErrorBody | null;

  const code = anyError.code ?? body?.error ?? "UNKNOWN_ERROR";
  const message =
    anyError.message ?? body?.message ?? "发生了意外错误 - UNKNOWN_ERROR";

  return {
    code,
    message,
    statusCode: anyError.statusCode,
  };
}

