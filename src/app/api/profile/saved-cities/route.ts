import { NextResponse } from "next/server";

import { addSavedLocation, getViewerState, removeSavedLocation } from "@/lib/profile";
import type { SavedLocation } from "@/types";

export async function GET() {
  const viewer = await getViewerState();

  return NextResponse.json(
    {
      saved_locations: viewer.profile?.saved_locations ?? []
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  const viewer = await getViewerState();

  if (!viewer.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as SavedLocation | null;

  if (
    !body ||
    !body.slug ||
    !body.name ||
    !body.country ||
    !Number.isFinite(body.lat) ||
    !Number.isFinite(body.lon) ||
    !body.timezone
  ) {
    return NextResponse.json({ error: "Invalid city payload." }, { status: 400 });
  }

  const profile = await addSavedLocation(viewer.user.id, body);
  if (!profile) {
    return NextResponse.json({ error: "Unable to save city." }, { status: 500 });
  }

  return NextResponse.json(profile);
}

export async function DELETE(request: Request) {
  const viewer = await getViewerState();

  if (!viewer.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 });
  }

  const profile = await removeSavedLocation(viewer.user.id, slug);
  if (!profile) {
    return NextResponse.json({ error: "Unable to remove city." }, { status: 500 });
  }

  return NextResponse.json(profile);
}
