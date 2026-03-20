import { NextResponse } from "next/server";

import { getRouteCacheHeaders } from "@/lib/api/cache";
import { fetchPollenSummary } from "@/lib/api/pollen";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "lat and lon query params are required." },
      { status: 400 }
    );
  }

  try {
    const payload = await fetchPollenSummary({ lat, lon });
    return NextResponse.json(payload, {
      headers: getRouteCacheHeaders()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected pollen API error"
      },
      { status: 500 }
    );
  }
}
