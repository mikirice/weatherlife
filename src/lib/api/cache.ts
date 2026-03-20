import { buildWeatherSnapshot, fetchOpenMeteoForecast } from "@/lib/api/open-meteo";
import { fetchPollenSummary } from "@/lib/api/pollen";
import { roundCoordinates } from "@/lib/geo";
import { calculateAllIndices } from "@/lib/indices";
import { getSupabaseAdminClient } from "@/lib/supabase";
import type {
  DashboardSnapshot,
  HourlyForecastItem,
  LifeIndexKey,
  PollenSummary
} from "@/types";

const EDGE_CACHE_SECONDS = 60 * 60;
const CLIENT_CACHE_SECONDS = 60 * 30;
const SUPABASE_CACHE_SECONDS = 60 * 60 * 3;

type MemoryCacheEntry = {
  expiresAt: number;
  payload: DashboardSnapshot;
};

declare global {
  var __dailyPulseCache__: Map<string, MemoryCacheEntry> | undefined;
}

const memoryCache = globalThis.__dailyPulseCache__ ?? new Map<string, MemoryCacheEntry>();

if (!globalThis.__dailyPulseCache__) {
  globalThis.__dailyPulseCache__ = memoryCache;
}

export async function getCachedDashboardSnapshot({
  lat,
  lon,
  timezone
}: {
  lat: number;
  lon: number;
  timezone?: string;
}): Promise<DashboardSnapshot> {
  const rounded = roundCoordinates(lat, lon);
  const cacheKey = `${rounded.lat}:${rounded.lon}`;
  const now = Date.now();
  const memoryHit = memoryCache.get(cacheKey);

  if (memoryHit && memoryHit.expiresAt > now) {
    return {
      ...memoryHit.payload,
      source: "memory-cache"
    };
  }

  const supabaseHit = await readSupabaseCache(rounded.lat, rounded.lon);
  if (supabaseHit) {
    memoryCache.set(cacheKey, {
      expiresAt: new Date(supabaseHit.fetchedAt).getTime() + SUPABASE_CACHE_SECONDS * 1000,
      payload: supabaseHit
    });

    return supabaseHit;
  }

  const weatherRaw = await fetchOpenMeteoForecast({ lat, lon, timezone });
  const weather = buildWeatherSnapshot(weatherRaw);
  const pollen = await fetchPollenSummary({ lat, lon });
  const fetchedAt = new Date().toISOString();
  const forecast = weather.daily.slice(0, 10).map((day, dayIndex, days) => {
    const next48HourRainProbability = getNext48HourRainProbability(days, dayIndex);

    return {
      date: day.date,
      label: formatForecastLabel(day.date, dayIndex),
      summary: day.summary,
      indices: calculateAllIndices({
        date: day.date,
        current: day.current,
        night: day.night,
        summary: day.summary,
        pollen: dayIndex === 0 ? pollen : unavailablePollenSummary,
        next48HourRainProbability
      })
    };
  });

  const payload: DashboardSnapshot = {
    current: weather.current,
    summary: weather.summary,
    hourly: weather.hourly,
    pollen,
    indices: forecast[0]?.indices ?? calculateAllIndices({
      date: weather.summary.date,
      current: weather.current,
      night: weather.daily[0]?.night ?? {
        cloudCover: weather.current.cloudCover,
        visibility: weather.current.visibility,
        weatherCode: weather.current.weatherCode,
        isDay: false
      },
      summary: weather.summary,
      pollen,
      next48HourRainProbability: weather.summary.maxPrecipitationProbability
    }),
    forecast,
    hourlyInsights: buildHourlyInsights(weather.hourly, weather.current.time),
    fetchedAt,
    rounded,
    source: "live"
  };

  memoryCache.set(cacheKey, {
    expiresAt: now + SUPABASE_CACHE_SECONDS * 1000,
    payload
  });

  await writeSupabaseCache({
    rounded,
    payload,
    weatherRaw,
    pollenRaw: pollen.raw ?? null
  });

  return payload;
}

export function getRouteCacheHeaders() {
  return {
    "Cache-Control": `public, max-age=${CLIENT_CACHE_SECONDS}, s-maxage=${EDGE_CACHE_SECONDS}, stale-while-revalidate=${SUPABASE_CACHE_SECONDS}`,
    "Vercel-CDN-Cache-Control": `public, s-maxage=${EDGE_CACHE_SECONDS}, stale-while-revalidate=${SUPABASE_CACHE_SECONDS}`
  };
}

async function readSupabaseCache(latRounded: number, lonRounded: number) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("weather_cache")
    .select("data, indices, fetched_at, expires_at")
    .eq("lat_rounded", latRounded)
    .eq("lon_rounded", lonRounded)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const payload = data.data as Omit<DashboardSnapshot, "indices" | "source">;
  return {
    ...payload,
    indices: data.indices as DashboardSnapshot["indices"],
    source: "supabase-cache" as const
  };
}

async function writeSupabaseCache({
  rounded,
  payload,
  weatherRaw,
  pollenRaw
}: {
  rounded: { lat: number; lon: number };
  payload: DashboardSnapshot;
  weatherRaw: unknown;
  pollenRaw: unknown;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  const expiresAt = new Date(Date.now() + SUPABASE_CACHE_SECONDS * 1000).toISOString();
  const { source: _source, indices, ...serializablePayload } = payload;

  await supabase.from("weather_cache").upsert(
    {
      lat_rounded: rounded.lat,
      lon_rounded: rounded.lon,
      data: {
        ...serializablePayload,
        raw: {
          weather: weatherRaw,
          pollen: pollenRaw
        }
      },
      indices,
      fetched_at: payload.fetchedAt,
      expires_at: expiresAt
    },
    {
      onConflict: "lat_rounded,lon_rounded"
    }
  );
}

function getNext48HourRainProbability(
  days: Array<{ summary: { maxPrecipitationProbability: number } }>,
  dayIndex: number
) {
  return Math.max(
    days[dayIndex]?.summary.maxPrecipitationProbability ?? 0,
    days[dayIndex + 1]?.summary.maxPrecipitationProbability ?? 0
  );
}

function formatForecastLabel(date: string, dayIndex: number) {
  if (dayIndex === 0) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T12:00:00Z`));
}

function buildHourlyInsights(hourly: HourlyForecastItem[], currentTime: string) {
  const currentHour = Number.parseInt(currentTime.slice(11, 13), 10);
  const upcoming = hourly.filter((item) => Number.parseInt(item.time.slice(11, 13), 10) >= currentHour);
  const rainStart = upcoming.find((item) => item.precipitationProbability >= 45);
  const peakUv = upcoming.reduce((best, item) => (item.uvIndex > best.uvIndex ? item : best), upcoming[0] ?? hourly[0]);
  const bestOutdoor = upcoming.reduce((best, item) => {
    const candidateScore =
      (10 - item.precipitationProbability / 10) +
      Math.max(0, 10 - Math.abs(item.temperature - 19) / 2) +
      Math.max(0, 10 - item.uvIndex);
    const bestScore =
      (10 - best.precipitationProbability / 10) +
      Math.max(0, 10 - Math.abs(best.temperature - 19) / 2) +
      Math.max(0, 10 - best.uvIndex);

    return candidateScore > bestScore ? item : best;
  }, upcoming[0] ?? hourly[0]);
  const evening = hourly.find((item) => item.displayTime === "9PM") ?? hourly[hourly.length - 1];

  return [
    {
      key: "umbrella" as LifeIndexKey,
      title: "Umbrella watch",
      icon: "☂️",
      summary: rainStart ? `Bring one from ${rainStart.displayTime}` : "No obvious umbrella window today"
    },
    {
      key: "uv" as LifeIndexKey,
      title: "UV peak",
      icon: "☀️",
      summary: peakUv ? `Strongest around ${peakUv.displayTime} (UV ${peakUv.uvIndex})` : "UV stays quiet"
    },
    {
      key: "exercise" as LifeIndexKey,
      title: "Best outdoor slot",
      icon: "🏃",
      summary: bestOutdoor ? `Most comfortable around ${bestOutdoor.displayTime}` : "Conditions stay mixed"
    },
    {
      key: "stargazing" as LifeIndexKey,
      title: "Tonight",
      icon: "🌟",
      summary: evening ? `${evening.displayTime} looks ${evening.weatherCode === 0 ? "clearer" : "mixed"}` : "Check back tonight"
    }
  ];
}

const unavailablePollenSummary: PollenSummary = {
  upi: 0,
  inSeason: false,
  category: "Unavailable",
  available: false,
  raw: null
};
