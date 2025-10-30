import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { CreateProjectForm } from "./create-project-form";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: {
      ownerId: session.userId,
      isDeleted: false,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      updates: true,
      highlights: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-sky-300">Your workshop chronicle</p>
            <h1 className="text-3xl font-semibold">
              Welcome back, {session.user.displayName ?? session.user.username}
            </h1>
            <p className="max-w-xl text-sm text-slate-200">
              Capture progress with block-based updates, press play to relive the build, and highlight the pivotal moments.
            </p>
          </div>
          <div className="rounded-2xl border border-sky-400/40 bg-slate-950/40 px-6 py-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Current stats</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-semibold text-sky-300">{projects.length}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">Projects</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-sky-300">
                  {projects.reduce((acc, project) => acc + project.updates.length, 0)}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-400">Updates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CreateProjectForm />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Your projects</h2>
          <Link href="/public" className="text-sm font-medium text-sky-600 hover:text-sky-500">
            View public gallery
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
            <p className="text-sm">No projects yet. Start by creating one above.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const publicBadge = project.visibility === "PUBLIC" ? "Public" : "Private";
              const tags = project.tags.map((entry) => entry.tag.name);
              const latestUpdate = project.updates.at(-1);

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-600">
                      {project.title}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        project.visibility === "PUBLIC"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {publicBadge}
                    </span>
                  </div>
                  {project.summary ? (
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">{project.summary}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                    <span>{project.updates.length} updates</span>
                    <span>{project.highlights.length} highlights</span>
                    <span>{latestUpdate ? new Date(latestUpdate.createdAt).toLocaleDateString() : "No updates"}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
