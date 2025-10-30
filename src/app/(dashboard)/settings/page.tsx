import { getSession } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Account settings</h1>
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm">
        <dl className="space-y-4 text-sm text-slate-700">
          <div>
            <dt className="font-medium text-slate-900">Username</dt>
            <dd>{session?.user.username}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Display name</dt>
            <dd>{session?.user.displayName ?? "Not set"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Role</dt>
            <dd>{session?.user.isAdmin ? "Administrator" : "Member"}</dd>
          </div>
        </dl>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
        <p className="text-sm text-slate-600">
          Password resets happen locally. Contact an instance admin if you get locked out.
        </p>
        <p className="mt-4 text-sm text-slate-500">Password management UI is tracked in AUTH-5.</p>
      </div>
    </div>
  );
}
