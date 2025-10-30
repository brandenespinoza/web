import { NextRequest } from "next/server";
import { UpdateBlockType } from "@/generated/prisma";

import { jsonResponse, validationErrorResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateSchema } from "@/lib/validators";
import { createProjectUpdate, getProjectUpdates } from "@/services/update-service";
import { getSession } from "@/lib/session";

interface Params {
  params: {
    projectId: string;
  };
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse({ ...body, projectId: params.projectId });
  if (!parsed.success) {
    return validationErrorResponse("Invalid update payload.", parsed.error.format());
  }

  const { blocks, headline, isDraft } = parsed.data;

  try {
    const update = await createProjectUpdate({
      projectId: params.projectId,
      authorId: user.id,
      headline: headline ?? null,
      isDraft: Boolean(isDraft),
      blocks: blocks.map((block) => ({
        position: block.position,
        type: block.type as UpdateBlockType,
        text: block.text ?? null,
        data: block.data ?? null,
      })),
    });

    return jsonResponse({ update });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Project not found.") {
        return jsonResponse({ error: error.message }, { status: 404 });
      }
      if (error.message === "Forbidden.") {
        return jsonResponse({ error: "Forbidden" }, { status: 403 });
      }
    }
    throw error;
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();

  try {
    const result = await getProjectUpdates(params.projectId, session?.userId);
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Project not found.") {
        return jsonResponse({ error: error.message }, { status: 404 });
      }
      if (error.message === "Forbidden.") {
        return jsonResponse({ error: "Forbidden" }, { status: 403 });
      }
    }
    throw error;
  }
}
