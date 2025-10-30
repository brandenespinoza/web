import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import { logoutAction } from "./dashboard/actions";

interface Props {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: Props) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const displayName = session.user.displayName ?? session.user.username;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
            ProjectChron
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/dashboard" className="transition hover:text-slate-900">
              My projects
            </Link>
            <Link href="/feed" className="transition hover:text-slate-900">
              Feed
            </Link>
            <Link href="/queue" className="transition hover:text-slate-900">
              Media queue
            </Link>
            <Link href="/settings" className="transition hover:text-slate-900">
              Settings
            </Link>
          </nav>
          <form action={logoutAction}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">{displayName}</span>
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                Log out
              </button>
            </div>
          </form>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
