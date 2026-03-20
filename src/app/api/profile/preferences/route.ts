import { NextResponse } from "next/server";

import { getViewerState, updateUserPreferences } from "@/lib/profile";

export async function POST(request: Request) {
  const viewer = await getViewerState();

  if (!viewer.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        pollen_alert?: boolean;
        runner?: boolean;
        cyclist?: boolean;
        units?: "metric" | "imperial";
      }
    | null;

  const profile = await updateUserPreferences(viewer.user.id, {
    pollen_alert: Boolean(body?.pollen_alert),
    runner: Boolean(body?.runner),
    cyclist: Boolean(body?.cyclist),
    units: body?.units === "imperial" ? "imperial" : "metric"
  });

  if (!profile) {
    return NextResponse.json({ error: "Unable to update preferences." }, { status: 500 });
  }

  return NextResponse.json(profile);
}
