import {
  JobStatus,
  MediaAsset,
  MediaAssetType,
  MediaJobType,
  MediaProcessingStatus,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

interface RegisterMediaAssetInput {
  projectId?: string | null;
  updateId?: string | null;
  type: MediaAssetType;
  originalPath: string;
  storageBucket?: string | null;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  filesize?: number | null;
  altText?: string | null;
  caption?: string | null;
  ownerId: string;
}

export async function registerMediaAsset(input: RegisterMediaAssetInput) {
  const {
    projectId,
    updateId,
    type,
    originalPath,
    storageBucket,
    width,
    height,
    durationSeconds,
    filesize,
    altText,
    caption,
    ownerId,
  } = input;

  const jobTypes =
    type === MediaAssetType.IMAGE
      ? [MediaJobType.IMAGE_OPTIMIZE]
      : [MediaJobType.VIDEO_TRANSCODE, MediaJobType.VIDEO_POSTER];

  return prisma.$transaction(async (tx) => {
    const media = await tx.mediaAsset.create({
      data: {
        projectId: projectId ?? undefined,
        updateId: updateId ?? undefined,
        type,
        status: MediaProcessingStatus.PENDING,
        originalPath,
        storageBucket: storageBucket ?? undefined,
        width: width ?? undefined,
        height: height ?? undefined,
        durationSeconds: durationSeconds ?? undefined,
        filesize: filesize ? BigInt(filesize) : undefined,
        altText: altText ?? undefined,
        caption: caption ?? undefined,
      },
    });

    await tx.mediaJob.createMany({
      data: jobTypes.map((jobType) => ({
        mediaId: media.id,
        jobType,
        status: JobStatus.PENDING,
      })),
    });

    await tx.auditLog.create({
      data: {
        actorId: ownerId,
        action: "media.register",
        entityType: "media",
        entityId: media.id,
      },
    });

    return media;
  });
}

export async function listMediaJobs(limit = 50) {
  const jobs = await prisma.mediaJob.findMany({
    include: {
      media: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return jobs;
}

export function serializeMediaAsset(asset: MediaAsset) {
  return {
    ...asset,
    filesize: asset.filesize ? Number(asset.filesize) : null,
  };
}
