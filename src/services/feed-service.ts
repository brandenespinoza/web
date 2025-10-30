import { prisma } from "@/lib/prisma";

interface FeedOptions {
  cursor?: string | null;
  limit?: number;
}

export async function getGlobalFeed(options: FeedOptions = {}) {
  const take = Math.min(options.limit ?? 20, 50);
  const cursor = options.cursor
    ? {
        id: options.cursor,
      }
    : undefined;

  const events = await prisma.feedEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: take + 1,
    cursor,
    skip: cursor ? 1 : 0,
    include: {
      project: {
        select: {
          id: true,
          title: true,
          slug: true,
          visibility: true,
        },
      },
      update: {
        select: {
          id: true,
          headline: true,
          createdAt: true,
        },
      },
      actor: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
  });

  let nextCursor: string | null = null;
  if (events.length > take) {
    const next = events.pop();
    nextCursor = next?.id ?? null;
  }

  return {
    events,
    nextCursor,
  };
}
