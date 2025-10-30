import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function PublicProjectsPage() {
  const projects = await prisma.project.findMany({
    where: {
      visibility: "PUBLIC",
      isDeleted: false,
    },
    include: {
      tags: { include: { tag: true } },
      updates: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      owner: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-24">
        <header className="space-y-3">
          <h1 className="text-4xl font-semibold">ProjectChron Public Gallery</h1>
          <p className="text-base text-slate-300">
            Follow builds in progress, skim highlights, and press play to relive the journey.
          </p>
        </header>
        <section className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group flex h-full flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition hover:-translate-y-1 hover:border-sky-500/60"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white group-hover:text-sky-400">
                    {project.title}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {project.updates.length > 0
                      ? `Updated ${new Date(project.updates[0].createdAt).toLocaleDateString()}`
                      : "No updates yet"}
                  </span>
                </div>
                {project.summary ? (
                  <p className="text-sm text-slate-300 line-clamp-3">{project.summary}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((entry) => (
                    <span
                      key={entry.tagId}
                      className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200"
                    >
                      {entry.tag.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
                <span>By {project.owner.displayName ?? project.owner.username}</span>
                <span>{project.updates.length > 0 ? "Story in progress" : "Story preparing"}</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
