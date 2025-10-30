import { NextRequest, NextResponse } from "next/server";

import { getSession, invalidateSession } from "@/lib/session";

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    throw unauthorizedResponse();
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) {
    throw forbiddenResponse();
  }
  return user;
}

export async function handleUnauthorized(req: NextRequest) {
  await invalidateSession(req);
  return unauthorizedResponse();
}

function unauthorizedResponse() {
  return new NextResponse(
    JSON.stringify({
      error: "Unauthorized",
    }),
    {
      status: 401,
      headers: {
        "content-type": "application/json",
      },
    },
  );
}

function forbiddenResponse() {
  return new NextResponse(
    JSON.stringify({
      error: "Forbidden",
    }),
    {
      status: 403,
      headers: {
        "content-type": "application/json",
      },
    },
  );
}

