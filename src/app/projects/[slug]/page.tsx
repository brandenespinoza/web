import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { AddUpdateForm } from "./add-update-form";
import { FollowButton } from "./follow-button";
interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getSession();
  const project = await prisma.project.findFirst({
    where: {
      slug: params.slug,
      isDeleted: false,
    },
    include: {
      owner: true,
      tags: { include: { tag: true } },
      highlights: { include: { update: true } },
    },
  });

  if (!project) {
    notFound();
  }

  const isOwner = session?.userId === project.ownerId;

  if (project.visibility === "PRIVATE" && !isOwner) {
    notFound();
  }

  const updates = await prisma.projectUpdate.findMany({
    where: {
      projectId: project.id,
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

  const tags = project.tags.map((entry) => entry.tag.name);
  const heroSubtitle = `${updates.length} update${updates.length === 1 ? "" : "s"}`;
  const followerCount = await prisma.follow.count({ where: { projectId: project.id } });
  let isFollowing = false;
  if (!isOwner && session) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_projectId: {
          followerId: session.userId,
          projectId: project.id,
        },
      },
    });
    isFollowing = Boolean(follow);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-12 px-6 pb-24 pt-24">
        <header className="space-y-6">
          <Link href={session ? "/dashboard" : "/public"} className="text-sm text-sky-400">
            ← Back
          </Link>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
              {project.visibility === "PUBLIC" ? "Public" : "Private"} project
            </p>
            <h1 className="text-4xl font-semibold leading-tight">{project.title}</h1>
            {project.summary ? <p className="text-base text-slate-300">{project.summary}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span>By {project.owner.displayName ?? project.owner.username}</span>
            <span>•</span>
            <span>{heroSubtitle}</span>
            <span>•</span>
            <span>{project.visibility === "PUBLIC" ? "Open to followers" : "Private"}</span>
            <span>•</span>
            <span>{followerCount} follower{followerCount === 1 ? "" : "s"}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-200">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300">
              ▶ Play story
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
              Highlights
            </button>
            {!isOwner && project.visibility === "PUBLIC" ? (
              session ? (
                <FollowButton projectId={project.id} initialFollowing={isFollowing} />
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
                >
                  Sign in to follow
                </Link>
              )
            ) : null}
          </div>
        </header>

        {isOwner ? (
          <AddUpdateForm projectId={project.id} />
        ) : null}

        {project.highlights.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-sky-300">Highlights</h2>
            <div className="flex flex-wrap gap-3">
              {project.highlights
                .sort((a, b) => new Date(a.update.createdAt).getTime() - new Date(b.update.createdAt).getTime())
                .map((highlight) => (
                  <a
                    key={highlight.id}
                    href={`#update-${highlight.updateId}`}
                    className="rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm text-slate-100 transition hover:bg-sky-500/20"
                  >
                    <div className="font-semibold text-white">
                      {highlight.update.headline ?? `Update ${highlight.update.createdAt.toLocaleDateString()}`}
                    </div>
                    <div className="text-xs text-slate-300">
                      {new Date(highlight.update.createdAt).toLocaleDateString()}
                    </div>
                  </a>
                ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-8">
          <div className="sticky top-4 z-10 flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-6 py-3 text-sm text-slate-200 backdrop-blur">
            <span className="font-semibold text-slate-100">Timeline</span>
            <div className="h-[1px] flex-1 bg-slate-700" />
            <span>{updates.length} ticks</span>
          </div>
          <div className="space-y-10">
            {updates.map((update) => (
              <article
                key={update.id}
                id={`update-${update.id}`}
                className="space-y-4 rounded-3xl border border-slate-900 bg-slate-900/50 p-6 shadow-lg"
              >
                <header className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {new Date(update.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="text-2xl font-semibold text-white">
                      {update.headline ?? "Project update"}
                    </h3>
                  </div>
                  {update.highlightEntry ? (
                    <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200">
                      Highlight
                    </span>
                  ) : null}
                </header>
                <div className="space-y-4">
                  {update.blocks.map((block) => {
                    switch (block.type) {
                      case "HEADING":
                        return (
                          <h4 key={block.id} className="text-xl font-semibold text-slate-100">
                            {block.text}
                          </h4>
                        );
                      case "QUOTE":
                        return (
                          <blockquote
                            key={block.id}
                            className="border-l-4 border-slate-700 bg-slate-900/60 px-4 py-2 text-slate-200"
                          >
                            {block.text}
                          </blockquote>
                        );
                      case "LIST":
                        {
                          const items = Array.isArray(block.data)
                            ? (block.data as string[])
                            : typeof block.text === "string"
                              ? block.text.split("\n").filter(Boolean)
                              : [];
                          return (
                            <ul key={block.id} className="list-disc space-y-2 pl-6 text-sm text-slate-200">
                              {items.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          );
                        }
                      case "PARAGRAPH":
                      default:
                        return (
                          <p key={block.id} className="text-base leading-7 text-slate-200">
                            {block.text}
                          </p>
                        );
                    }
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
