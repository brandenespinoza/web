"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
}

export function AddUpdateForm({ projectId }: Props) {
  const router = useRouter();
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const paragraphs = body
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      setError("Include at least one paragraph.");
      setLoading(false);
      return;
    }

    const blocks = paragraphs.map((text, index) => ({
      position: index,
      type: "PARAGRAPH",
      text,
    }));

    try {
      const response = await fetch(`/api/projects/${projectId}/updates`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          headline: headline.trim() || undefined,
          blocks,
          isDraft: false,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Unable to save update.");
        setLoading(false);
        return;
      }

      setHeadline("");
      setBody("");
      setLoading(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Add a project update</h2>
        <p className="text-sm text-slate-300">
          Paste paragraphs separated by blank lines. Media uploads and advanced blocks will land in a future iteration.
        </p>
      </div>
      <div className="space-y-1">
        <label htmlFor="headline" className="text-sm font-medium text-slate-200">
          Headline <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="headline"
          name="headline"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          maxLength={160}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-300"
          placeholder="Wiring the LED matrix"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="body" className="text-sm font-medium text-slate-200">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={6}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-300"
          placeholder={"Recap your progress...\n\nSeparate paragraphs with a blank line."}
          maxLength={5000}
          required
        />
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving…" : "Post update"}
      </button>
    </form>
  );
}
