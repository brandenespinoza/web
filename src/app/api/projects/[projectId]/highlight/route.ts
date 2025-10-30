import { NextRequest } from "next/server";

import { jsonResponse, validationErrorResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { highlightToggleSchema } from "@/lib/validators";
import { toggleHighlight } from "@/services/update-service";

interface Params {
  params: {
    projectId: string;
  };
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);
  const parsed = highlightToggleSchema.safeParse({
    ...body,
    projectId: params.projectId,
  });

  if (!parsed.success) {
    return validationErrorResponse("Invalid highlight payload.", parsed.error.format());
  }

  try {
    await toggleHighlight({
      projectId: params.projectId,
      updateId: parsed.data.updateId,
      actorId: user.id,
      enabled: parsed.data.enabled,
    });

    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Project not found.") {
        return jsonResponse({ error: error.message }, { status: 404 });
      }
      if (error.message === "Update not found.") {
        return jsonResponse({ error: error.message }, { status: 404 });
      }
      if (error.message === "Highlight limit reached.") {
        return jsonResponse({ error: error.message }, { status: 400 });
      }
      if (error.message === "Forbidden.") {
        return jsonResponse({ error: "Forbidden" }, { status: 403 });
      }
    }
    throw error;
  }
}

