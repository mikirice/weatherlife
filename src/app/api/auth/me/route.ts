import { NextResponse } from "next/server";

import { getViewerState } from "@/lib/profile";

export async function GET() {
  const viewer = await getViewerState();
  return NextResponse.json(viewer, { status: 200 });
}
