import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-sm text-slate-300">
            Sign in to continue chronicling your projects.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-slate-400">
          Need an account? <a className="font-medium text-sky-400" href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}
