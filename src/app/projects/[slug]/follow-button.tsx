"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  projectId: string;
  initialFollowing: boolean;
}

export function FollowButton({ projectId, initialFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFollow = async () => {
    setLoading(true);
    setError(null);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/projects/${projectId}/follow`, {
        method,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Unable to update follow state.");
        setLoading(false);
        return;
      }

      setIsFollowing(!isFollowing);
      setLoading(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Network error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={toggleFollow}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60 ${
          isFollowing
            ? "border border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500"
            : "bg-sky-500 text-white hover:bg-sky-400"
        }`}
      >
        {loading ? "Updating…" : isFollowing ? "Following" : "Follow"}
      </button>
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
