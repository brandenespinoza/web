import { NextRequest } from "next/server";

import { jsonResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { listMediaJobs, serializeMediaAsset } from "@/services/media-service";

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user.isAdmin) {
    return jsonResponse({ error: "Forbidden" }, { status: 403 });
  }

  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(Number(limitParam) || 50, 200) : 50;

  const jobs = await listMediaJobs(limit);

  return jsonResponse({
    jobs: jobs.map((job) => ({
      id: job.id,
      jobType: job.jobType,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      scheduledAt: job.scheduledAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      lastError: job.lastError,
      media: serializeMediaAsset(job.media),
    })),
  });
}
