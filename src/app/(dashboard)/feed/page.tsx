import Link from "next/link";

import { getGlobalFeed } from "@/services/feed-service";

export default async function FeedPage() {
  const { events } = await getGlobalFeed({ limit: 40 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Global activity feed</h1>
        <p className="text-sm text-slate-600">
          Follow projects to keep this stream relevant. This MVP shows combined activity across the instance.
        </p>
      </div>
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500">
            <p>No activity yet. Create a project and post an update to see the story appear here.</p>
          </div>
        ) : null}
        {events.map((event) => (
          <article
            key={event.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
              <span>{new Date(event.createdAt).toLocaleString()}</span>
              <span>{event.type.replace(/_/g, " ")}</span>
            </div>
            <div className="space-y-2">
              <Link
                href={`/projects/${event.project.slug}`}
                className="text-lg font-semibold text-slate-900 hover:text-sky-600"
              >
                {event.project.title}
              </Link>
              {event.update ? (
                <p className="text-sm text-slate-600">
                  Update: <span className="font-medium text-slate-900">{event.update.headline ?? "Untitled"}</span>
                </p>
              ) : null}
              {event.actor ? (
                <p className="text-sm text-slate-500">
                  by {event.actor.displayName ?? event.actor.username}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
