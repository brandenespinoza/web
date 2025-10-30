import { NextRequest } from "next/server";
import { ProjectVisibility } from "@/generated/prisma";

import { jsonResponse, validationErrorResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { projectSchema } from "@/lib/validators";
import { createProject } from "@/services/project-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse("Invalid project payload.", parsed.error.format());
  }

  const payload = parsed.data;
  const project = await createProject({
    ownerId: user.id,
    title: payload.title,
    summary: payload.summary,
    visibility: payload.visibility as ProjectVisibility | undefined,
    tags: payload.tags,
    coverImageId: payload.coverImageId ?? undefined,
  });

  return jsonResponse({ project });
}

export async function GET() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where: {
      ownerId: user.id,
      isDeleted: false,
    },
    include: {
      tags: {
        include: { tag: true },
      },
      highlights: {
        include: { update: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return jsonResponse({
    projects: projects.map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      visibility: project.visibility,
      createdAt: project.createdAt,
      tags: project.tags.map((entry) => entry.tag.name),
      highlightCount: project.highlights.length,
    })),
  });
}
