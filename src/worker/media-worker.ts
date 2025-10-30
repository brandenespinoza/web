/*
 * Minimal media worker stub. Replace with a proper queue processor as the
 * pipeline matures. The worker polls the database for pending jobs and logs
 * the intent to process them. Actual Sharp/FFmpeg integration is tracked in
 * MEDIA-2 and MEDIA-3.
 */

import "dotenv/config";

import { JobStatus, MediaProcessingStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

const POLL_INTERVAL_MS = Number(process.env.MEDIA_WORKER_INTERVAL ?? 10000);

async function pollOnce() {
  const jobs = await prisma.mediaJob.findMany({
    where: { status: JobStatus.PENDING },
    include: { media: true },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  if (jobs.length === 0) {
    return;
  }

  for (const job of jobs) {
    console.log(
      `[worker] Pretending to process ${job.jobType} for media ${job.mediaId} (job ${job.id}).`,
    );

    await prisma.mediaJob.update({
      where: { id: job.id },
      data: {
        status: JobStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    await prisma.mediaAsset.update({
      where: { id: job.mediaId },
      data: {
        status: MediaProcessingStatus.READY,
      },
    });
  }
}

async function run() {
  while (true) {
    try {
      await pollOnce();
    } catch (error) {
      console.error("[worker] media job polling failed", error);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error("[worker] fatal error", error);
    process.exit(1);
  });
}
