import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { randomBytes, createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "pc_session";
const SESSION_MAX_AGE_DAYS = 30;

function makeExpiryDate() {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_MAX_AGE_DAYS);
  return expires;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function readClientMeta(req?: NextRequest | Request) {
  if (!req) {
    return {
      ipAddress: undefined,
      userAgent: undefined,
    };
  }

  const headers = req instanceof NextRequest ? req.headers : req.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? undefined;
  const userAgent = headers.get("user-agent") ?? undefined;

  return { ipAddress, userAgent };
}

export async function createSession(userId: string, req?: NextRequest | Request) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = makeExpiryDate();
  const { ipAddress, userAgent } = readClientMeta(req);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function getSession() {
  const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashToken(sessionToken);
  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    await deleteSessionCookie();
    if (session) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });
    }
    return null;
  }

  return session;
}

export async function rotateSession(sessionId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = makeExpiryDate();

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      tokenHash,
      expiresAt,
    },
  });

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function invalidateSession() {
  const cookie = cookies().get(SESSION_COOKIE_NAME);
  if (!cookie) {
    return;
  }

  const tokenHash = hashToken(cookie.value);
  await prisma.session.deleteMany({
    where: { tokenHash },
  });
  await deleteSessionCookie();
}

async function deleteSessionCookie() {
  cookies().set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
