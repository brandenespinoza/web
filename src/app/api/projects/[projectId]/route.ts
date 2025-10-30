import { NextRequest } from "next/server";
import { ProjectVisibility } from "@/generated/prisma";

import { jsonResponse, validationErrorResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { projectSchema } from "@/lib/validators";
import { softDeleteProject, updateProject } from "@/services/project-service";

interface Params {
  params: {
    projectId: string;
  };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await requireUser();

  const body = await req.json().catch(() => null);
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse("Invalid project payload.", parsed.error.format());
  }

  const project = await updateProject({
    projectId: params.projectId,
    actorId: user.id,
    title: parsed.data.title,
    summary: parsed.data.summary,
    visibility: parsed.data.visibility as ProjectVisibility | undefined,
    tags: parsed.data.tags,
    coverImageId: parsed.data.coverImageId ?? undefined,
  });

  if (!project) {
    return jsonResponse({ error: "Project not found." }, { status: 404 });
  }

  return jsonResponse({ project });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requireUser();
  const project = await softDeleteProject({
    projectId: params.projectId,
    actorId: user.id,
  });

  if (!project) {
    return jsonResponse({ error: "Project not found." }, { status: 404 });
  }

  return jsonResponse({ success: true });
}
