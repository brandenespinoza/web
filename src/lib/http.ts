import { NextResponse } from "next/server";

export function jsonResponse<T>(data: T, init?: ResponseInit) {
  return new NextResponse(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export function validationErrorResponse(message: string, issues?: unknown) {
  return jsonResponse(
    {
      error: message,
      issues,
    },
    { status: 400 },
  );
}

