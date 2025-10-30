import { UpdateBlockType } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

interface BlockInput {
  position: number;
  type: UpdateBlockType;
  text?: string | null;
  data?: unknown;
}

interface CreateUpdateInput {
  projectId: string;
  authorId: string;
  headline?: string | null;
  blocks: BlockInput[];
  isDraft?: boolean;
}

export async function createProjectUpdate(input: CreateUpdateInput) {
  const { projectId, authorId, headline, blocks, isDraft = false } = input;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      isDeleted: false,
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.ownerId !== authorId) {
    throw new Error("Forbidden.");
  }

  if (blocks.length === 0 || blocks.length > 200) {
    throw new Error("Updates must include between 1 and 200 blocks.");
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);

  const update = await prisma.$transaction(async (tx) => {
    const created = await tx.projectUpdate.create({
      data: {
        projectId,
        authorId,
        headline: headline?.trim() ? headline.trim() : null,
        isDraft,
      },
    });

    await tx.updateBlock.createMany({
      data: sortedBlocks.map((block, index) => ({
        updateId: created.id,
        position: index,
        type: block.type,
        text: block.text ?? null,
        data: block.data ?? null,
      })),
    });

    await tx.auditLog.create({
      data: {
        actorId: authorId,
        action: "update.create",
        entityType: "update",
        entityId: created.id,
      },
    });

    if (!isDraft) {
      await tx.feedEvent.create({
        data: {
          type: "UPDATE_PUBLISHED",
          projectId,
          updateId: created.id,
          actorId: authorId,
        },
      });
    }

    return created;
  });

  return update;
}

export async function getProjectUpdates(projectId: string, viewerId?: string | null) {
  const project = await prisma.project.findUnique({
    where: { id: projectId, isDeleted: false },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.visibility === "PRIVATE" && project.ownerId !== viewerId) {
    throw new Error("Forbidden.");
  }

  const updates = await prisma.projectUpdate.findMany({
    where: {
      projectId,
      isDraft: false,
    },
    include: {
      blocks: {
        orderBy: { position: "asc" },
      },
      highlightEntry: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    project,
    updates,
  };
}

interface HighlightToggleInput {
  projectId: string;
  updateId: string;
  actorId: string;
  enabled: boolean;
}

export async function toggleHighlight(input: HighlightToggleInput) {
  const { projectId, updateId, actorId, enabled } = input;

  const project = await prisma.project.findUnique({
    where: { id: projectId, isDeleted: false },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.ownerId !== actorId) {
    throw new Error("Forbidden.");
  }

  const update = await prisma.projectUpdate.findUnique({
    where: { id: updateId },
  });

  if (!update || update.projectId !== projectId) {
    throw new Error("Update not found.");
  }

  if (enabled) {
    const highlightCount = await prisma.projectHighlight.count({
      where: { projectId },
    });

    if (highlightCount >= 5) {
      throw new Error("Highlight limit reached.");
    }

    await prisma.projectHighlight.upsert({
      where: { updateId },
      update: {},
      create: {
        projectId,
        updateId,
      },
    });

    await prisma.feedEvent.create({
      data: {
        type: "PROJECT_HIGHLIGHTED",
        projectId,
        updateId,
        actorId,
      },
    });
  } else {
    await prisma.projectHighlight.deleteMany({
      where: { updateId },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      action: enabled ? "highlight.enable" : "highlight.disable",
      entityType: "update",
      entityId: updateId,
    },
  });
}
