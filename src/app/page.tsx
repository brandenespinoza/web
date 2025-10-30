import Link from "next/link";

import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  const primaryCtaHref = session ? "/dashboard" : "/register";
  const primaryCtaLabel = session ? "Go to dashboard" : "Get started";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-28">
        <header className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400">ProjectChron</p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Chronicle every build with a scrubbable, cinematic timeline.
            </h1>
            <p className="text-lg text-slate-300">
              Capture iterative progress with block-based updates, toggle highlights for pivotal moments, and press play to watch the story unfold.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                {primaryCtaLabel}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white"
              >
                Sign in
              </Link>
            </div>
            <ul className="grid gap-3 text-sm text-slate-300">
              <li>• Private-by-default, publish per project when you are ready.</li>
              <li>• Local video ingest with queue processing and responsive playback.</li>
              <li>• Highlights, Play as Story, and a global feed for followers.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-sky-300">Timeline preview</h2>
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                {["Frame & joinery", "Electronics install", "First power on", "Polish & ship"].map(
                  (title, index) => (
                    <div key={title} className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <span className="absolute inset-0 rounded-full border border-slate-700 bg-slate-800/80" />
                        <span className="absolute inset-2 rounded-full bg-sky-400/80" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="text-xs text-slate-400">{4 + index * 3} days ago · Highlight</p>
                      </div>
                    </div>
                  ),
                )}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm font-medium text-slate-200">Play as Story</p>
                <div className="mt-3 flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white">▶</span>
                  <span>Lean back and watch updates auto-advance with captions and media.</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 md:grid-cols-3">
          {[
            {
              title: "Block-based updates",
              description:
                "Compose paragraphs, images, video, lists, and quotes. Validate schema server-side and keep an immutable audit trail.",
            },
            {
              title: "Media pipeline",
              description:
                "500 MB uploads, Sharp image optimization, FFmpeg transcoding, local storage or S3-compatible buckets.",
            },
            {
              title: "Scrubber + Highlights",
              description:
                "Scrubbable timeline with hover previews, Play as Story controls, and up to five highlights per project.",
            },
          ].map((feature) => (
            <div key={feature.title} className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-300">{feature.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
