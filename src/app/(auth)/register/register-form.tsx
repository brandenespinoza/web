"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password,
          displayName,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Unable to register. Try a different username.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Unable to reach the server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          autoComplete="username"
          minLength={3}
          maxLength={32}
          pattern="[a-z0-9_-]+"
          required
        />
        <p className="text-xs text-slate-400">Lowercase letters, numbers, dashes, and underscores only.</p>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="displayName">
          Display name <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="displayName"
          name="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          maxLength={120}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          autoComplete="new-password"
          minLength={12}
          required
        />
        <p className="text-xs text-slate-400">Minimum 12 characters for security.</p>
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
