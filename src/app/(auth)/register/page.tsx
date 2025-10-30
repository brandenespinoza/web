import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Create your ProjectChron account</h1>
          <p className="text-sm text-slate-300">
            Start documenting your builds with scrubbable stories.
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-slate-400">
          Already have an account? <a className="font-medium text-sky-400" href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
}
