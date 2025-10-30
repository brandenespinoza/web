import { getSession } from "@/lib/session";
import { listMediaJobs, serializeMediaAsset } from "@/services/media-service";

export default async function QueuePage() {
  const session = await getSession();
  if (!session?.user.isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Media processing queue</h1>
        <p className="text-sm text-slate-600">
          Only administrators can access the queue. Ask your instance operator for access.
        </p>
      </div>
    );
  }

  const jobs = await listMediaJobs(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Media processing queue</h1>
      <p className="text-sm text-slate-600">
        Real transcoding work lands in MEDIA-2/3. For now this table surfaces queued assets.
      </p>
      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500">
          <p>No jobs yet. Upload media from the project editor to populate this queue.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {jobs.map((job) => {
                const media = serializeMediaAsset(job.media);
                return (
                  <tr key={job.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{job.jobType}</td>
                    <td className="px-4 py-3 text-slate-700">{job.status}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {job.attempts}/{job.maxAttempts}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {media.type} · {media.originalPath}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
