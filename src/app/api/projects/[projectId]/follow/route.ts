import { jsonResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { followProject, unfollowProject } from "@/services/follow-service";

interface Params {
  params: {
    projectId: string;
  };
}

export async function POST(_req: Request, { params }: Params) {
  const user = await requireUser();
  try {
    await followProject({ projectId: params.projectId, userId: user.id });
    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Project not found.") {
        return jsonResponse({ error: error.message }, { status: 404 });
      }
      if (error.message === "Project is not public.") {
        return jsonResponse({ error: error.message }, { status: 403 });
      }
    }
    throw error;
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await requireUser();
  await unfollowProject({ projectId: params.projectId, userId: user.id });
  return jsonResponse({ success: true });
}
