import { ProjectVisibility } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

interface CreateProjectInput {
  title: string;
  summary?: string | null;
  visibility?: ProjectVisibility;
  tags?: string[];
  coverImageId?: string | null;
  ownerId: string;
}

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

async function ensureUniqueSlug(title: string) {
  const base = generateSlug(title);
  if (!base) {
    return generateSlug(`project-${Date.now()}`);
  }

  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug: candidate } });
    if (!existing) {
      return candidate;
    }

    suffix += 1;
    candidate = generateSlug(base, String(suffix));
  }
}

export async function createProject(input: CreateProjectInput) {
  const { tags = [], ownerId, visibility = ProjectVisibility.PRIVATE, title, summary, coverImageId } = input;
  const uniqueTags = Array.from(new Set(tags.map(normalizeTag))).filter(Boolean).slice(0, 10);

  const slug = await ensureUniqueSlug(title);

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        title,
        summary: summary?.trim() ? summary.trim() : null,
        visibility,
        slug,
        ownerId,
        coverImageId: coverImageId ?? undefined,
      },
    });

    if (uniqueTags.length > 0) {
      const tagRecords = await Promise.all(
        uniqueTags.map((tag) =>
          tx.tag.upsert({
            where: { name: tag },
            update: {},
            create: { name: tag },
          }),
        ),
      );

      await tx.projectTag.createMany({
        data: tagRecords.map((tag) => ({
          projectId: createdProject.id,
          tagId: tag.id,
        })),
        skipDuplicates: true,
      });
    }

    await tx.auditLog.create({
      data: {
        actorId: ownerId,
        action: "project.create",
        entityType: "project",
        entityId: createdProject.id,
      },
    });

    await tx.feedEvent.create({
      data: {
        type: "PROJECT_CREATED",
        projectId: createdProject.id,
        actorId: ownerId,
      },
    });

    return createdProject;
  });

  return project;
}

interface UpdateProjectInput {
  projectId: string;
  title?: string;
  summary?: string | null;
  visibility?: ProjectVisibility;
  tags?: string[];
  coverImageId?: string | null;
  actorId: string;
}

export async function updateProject(input: UpdateProjectInput) {
  const { projectId, title, summary, visibility, tags, coverImageId, actorId } = input;

  const existing = await prisma.project.findFirst({
    where: {
      id: projectId,
      isDeleted: false,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!existing) {
    return null;
  }

  const data: Record<string, unknown> = {};
  if (title) {
    data.title = title;
  }
  if (typeof summary !== "undefined") {
    data.summary = summary?.trim() ? summary.trim() : null;
  }
  if (typeof visibility !== "undefined") {
    data.visibility = visibility;
  }
  if (typeof coverImageId !== "undefined") {
    data.coverImageId = coverImageId;
  }

  const newSlugNeeded = title && title !== existing.title;
  if (newSlugNeeded) {
    data.slug = await ensureUniqueSlug(title);
  }

  const project = await prisma.$transaction(async (tx) => {
    const updated = await tx.project.update({
      where: { id: projectId },
      data,
    });

    if (Array.isArray(tags)) {
      const normalizedTags = Array.from(new Set(tags.map(normalizeTag))).filter(Boolean).slice(0, 10);

      const tagRecords = await Promise.all(
        normalizedTags.map((tag) =>
          tx.tag.upsert({
            where: { name: tag },
            update: {},
            create: { name: tag },
          }),
        ),
      );

      await tx.projectTag.deleteMany({
        where: {
          projectId,
          tagId: {
            notIn: tagRecords.map((tag) => tag.id),
          },
        },
      });

      await tx.projectTag.createMany({
        data: tagRecords
          .filter((tag) => !existing.tags.some((existingTag) => existingTag.tagId === tag.id))
          .map((tag) => ({
            projectId,
            tagId: tag.id,
          })),
        skipDuplicates: true,
      });
    }

    await tx.auditLog.create({
      data: {
        actorId,
        action: "project.update",
        entityType: "project",
        entityId: projectId,
      },
    });

    if (typeof visibility !== "undefined" && visibility !== existing.visibility) {
      await tx.feedEvent.create({
        data: {
          type: "PROJECT_VISIBILITY_CHANGED",
          projectId: projectId,
          actorId,
        },
      });
    }

    return updated;
  });

  return project;
}

interface DeleteProjectInput {
  projectId: string;
  actorId: string;
}

export async function softDeleteProject(input: DeleteProjectInput) {
  const { projectId, actorId } = input;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return null;
  }

  const deleted = await prisma.project.update({
    where: { id: projectId },
    data: {
      isDeleted: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "project.delete",
      entityType: "project",
      entityId: projectId,
    },
  });

  return deleted;
}
