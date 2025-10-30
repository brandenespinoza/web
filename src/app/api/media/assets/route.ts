import { NextRequest } from "next/server";

import { jsonResponse, validationErrorResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { mediaAssetSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { registerMediaAsset, serializeMediaAsset } from "@/services/media-service";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const payload = await req.json().catch(() => null);
  const parsed = mediaAssetSchema.safeParse(payload);

  if (!parsed.success) {
    return validationErrorResponse("Invalid media payload.", parsed.error.format());
  }

  const data = parsed.data;

  if (data.updateId) {
    const update = await prisma.projectUpdate.findUnique({
      where: { id: data.updateId },
    });
    if (!update) {
      return jsonResponse({ error: "Update not found." }, { status: 404 });
    }
    if (update.authorId !== user.id && !user.isAdmin) {
      return jsonResponse({ error: "Forbidden" }, { status: 403 });
    }
  } else if (data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });
    if (!project) {
      return jsonResponse({ error: "Project not found." }, { status: 404 });
    }
    if (project.ownerId !== user.id && !user.isAdmin) {
      return jsonResponse({ error: "Forbidden" }, { status: 403 });
    }
  }

  const asset = await registerMediaAsset({
    projectId: data.projectId ?? null,
    updateId: data.updateId ?? null,
    type: data.type,
    originalPath: data.originalPath,
    storageBucket: data.storageBucket ?? null,
    width: data.width ?? null,
    height: data.height ?? null,
    durationSeconds: data.durationSeconds ?? null,
    filesize: data.filesize ?? null,
    altText: data.altText ?? null,
    caption: data.caption ?? null,
    ownerId: user.id,
  });

  return jsonResponse({ asset: serializeMediaAsset(asset) });
}
