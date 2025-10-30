import { prisma } from "@/lib/prisma";

interface AuditLogInput {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function writeAuditLog(input: AuditLogInput) {
  const { actorId, action, entityType, entityId, changes, ipAddress } = input;
  await prisma.auditLog.create({
    data: {
      actorId: actorId ?? undefined,
      action,
      entityType,
      entityId,
      changes,
      ipAddress: ipAddress ?? undefined,
    },
  });
}

