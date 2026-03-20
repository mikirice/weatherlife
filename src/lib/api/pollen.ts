import type { OpenMeteoAirQualityResponse, PollenSummary } from "@/types/weather";

/**
 * Simple request queue to avoid hitting Open-Meteo rate limits (429).
 * Mirrors the 200ms throttle used in open-meteo.ts.
 */
const REQUEST_DELAY_MS = 200;
let lastRequestTime = 0;
const requestQueue = Promise.resolve();
let queueChain = requestQueue;

function enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
  const task = queueChain.then(async () => {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < REQUEST_DELAY_MS) {
      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS - elapsed));
    }
    lastRequestTime = Date.now();
    return fn();
  });
  queueChain = task.then(() => undefined, () => undefined);
  return task;
}

const POLLEN_FIELDS = [
  "birch_pollen",
  "grass_pollen",
  "alder_pollen",
  "ragweed_pollen",
  "olive_pollen",
  "mugwort_pollen"
];

function categorize(value: number): string {
  if (value <= 0) return "None";
  if (value <= 20) return "Low";
  if (value <= 50) return "Moderate";
  if (value <= 100) return "High";
  return "Very High";
}

/**
 * Map raw pollen grains/m3 to a 0-5 UPI scale for the pollen index.
 * The downstream pollenIndex() multiplies by 2 and clamps to 0-10.
 */
function toUpi(maxValue: number): number {
  if (maxValue <= 0) return 0;
  if (maxValue <= 20) return 1;
  if (maxValue <= 50) return 2;
  if (maxValue <= 100) return 3;
  return 4;
}

export async function fetchPollenSummary({
  lat,
  lon
}: {
  lat: number;
  lon: number;
}): Promise<PollenSummary> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: POLLEN_FIELDS.join(",")
  });

  try {
    const raw = await enqueueRequest(async () => {
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`,
        {
          next: { revalidate: 60 * 60 },
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!response.ok) {
        throw new Error(`Open-Meteo Air Quality request failed with ${response.status}`);
      }

      return (await response.json()) as OpenMeteoAirQualityResponse;
    });

    const current = raw.current;
    const pollenValues = [
      current.birch_pollen ?? 0,
      current.grass_pollen ?? 0,
      current.alder_pollen ?? 0,
      current.ragweed_pollen ?? 0,
      current.olive_pollen ?? 0,
      current.mugwort_pollen ?? 0
    ];

    const maxValue = Math.max(...pollenValues);
    const inSeason = pollenValues.some((v) => v > 0);
    const upi = toUpi(maxValue);
    const category = categorize(maxValue);

    return {
      upi,
      inSeason,
      category,
      available: true,
      raw
    };
  } catch (error) {
    console.warn("Open-Meteo Air Quality fetch failed:", (error as Error).message);
    return {
      upi: 0,
      inSeason: false,
      category: "Unavailable",
      available: false,
      raw: null
    };
  }
}
