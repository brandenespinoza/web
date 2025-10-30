import { NextRequest } from "next/server";

import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { jsonResponse, validationErrorResponse } from "@/lib/http";
import { changePasswordSchema } from "@/lib/validators";
import { getSession, rotateSession } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse("Invalid password change payload.", parsed.error.format());
  }

  const { currentPassword, newPassword } = parsed.data;
  const valid = await verifyPassword(session.user.passwordHash, currentPassword);
  if (!valid) {
    return jsonResponse({ error: "Current password is incorrect." }, { status: 400 });
  }

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      passwordHash: newHash,
    },
  });

  await rotateSession(session.id);

  await writeAuditLog({
    actorId: session.userId,
    action: "auth.change_password",
    entityType: "user",
    entityId: session.userId,
  });

  return jsonResponse({ success: true });
}

