import { NextResponse } from "next/server";

import { invalidateSession } from "@/lib/session";
import { jsonResponse } from "@/lib/http";

export async function POST() {
  await invalidateSession();
  return jsonResponse({ success: true });
}

export function GET() {
  return new NextResponse(null, { status: 405 });
}
