import { NextRequest } from "next/server";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { jsonResponse, validationErrorResponse } from "@/lib/http";
import { registerSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse("Invalid registration payload.", parsed.error.format());
  }

  const { username, password, displayName } = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    return jsonResponse({ error: "Username is already taken." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      displayName: displayName?.trim() ? displayName.trim() : null,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "auth.register",
    entityType: "user",
    entityId: user.id,
  });

  await createSession(user.id, req);

  return jsonResponse({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  });
}

