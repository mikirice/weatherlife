import { NextResponse } from "next/server";

import { getCachedDashboardSnapshot, getRouteCacheHeaders } from "@/lib/api/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const timezone = searchParams.get("timezone") ?? undefined;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "lat and lon query params are required." },
      { status: 400 }
    );
  }

  try {
    const payload = await getCachedDashboardSnapshot({ lat, lon, timezone });
    return NextResponse.json(payload, {
      headers: getRouteCacheHeaders()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected weather API error"
      },
      { status: 500 }
    );
  }
}
