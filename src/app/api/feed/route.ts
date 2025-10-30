import { NextRequest } from "next/server";

import { jsonResponse } from "@/lib/http";
import { getGlobalFeed } from "@/services/feed-service";

export async function GET(req: NextRequest) {
  const limitParam = req.nextUrl.searchParams.get("limit");
  const cursor = req.nextUrl.searchParams.get("cursor");
  const limit = limitParam ? Math.min(Number(limitParam) || 20, 50) : 20;

  const { events, nextCursor } = await getGlobalFeed({ cursor, limit });

  return jsonResponse({
    events: events.map((event) => ({
      id: event.id,
      type: event.type,
      createdAt: event.createdAt,
      project: {
        id: event.project.id,
        title: event.project.title,
        slug: event.project.slug,
        visibility: event.project.visibility,
      },
      update: event.update
        ? {
            id: event.update.id,
            headline: event.update.headline,
            createdAt: event.update.createdAt,
          }
        : null,
      actor: event.actor
        ? {
            id: event.actor.id,
            username: event.actor.username,
            displayName: event.actor.displayName,
          }
        : null,
    })),
    nextCursor,
  });
}
