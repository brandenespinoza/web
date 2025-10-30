import { NextRequest } from "next/server";

import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createSession, invalidateSession } from "@/lib/session";
import { jsonResponse, validationErrorResponse } from "@/lib/http";
import { loginSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse("Invalid login payload.", parsed.error.format());
  }

  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return jsonResponse({ error: "Invalid username or password." }, { status: 401 });
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    return jsonResponse({ error: "Invalid username or password." }, { status: 401 });
  }

  await invalidateSession();
  await createSession(user.id, req);

  await writeAuditLog({
    actorId: user.id,
    action: "auth.login",
    entityType: "user",
    entityId: user.id,
  });

  return jsonResponse({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  });
}
