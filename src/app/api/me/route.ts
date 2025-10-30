import { jsonResponse } from "@/lib/http";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return jsonResponse({ user: null });
  }

  return jsonResponse({
    user: {
      id: session.user.id,
      username: session.user.username,
      displayName: session.user.displayName,
      isAdmin: session.user.isAdmin,
    },
  });
}

