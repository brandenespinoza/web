import { prisma } from "@/lib/prisma";

export async function followProject({ projectId, userId }: { projectId: string; userId: string }) {
  const project = await prisma.project.findUnique({
    where: { id: projectId, isDeleted: false },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.visibility !== "PUBLIC" && project.ownerId !== userId) {
    throw new Error("Project is not public.");
  }

  await prisma.follow.upsert({
    where: {
      followerId_projectId: {
        followerId: userId,
        projectId,
      },
    },
    update: {},
    create: {
      followerId: userId,
      projectId,
    },
  });
}

export async function unfollowProject({ projectId, userId }: { projectId: string; userId: string }) {
  await prisma.follow.deleteMany({
    where: {
      followerId: userId,
      projectId,
    },
  });
}
