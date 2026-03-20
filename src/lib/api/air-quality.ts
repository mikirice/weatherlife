export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  label: string;
  color: string;
  advice: string;
  hourly: { time: string; aqi: number }[];
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      hourly: "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi",
      forecast_days: "1",
    });

    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();

    const h = data.hourly;
    const now = new Date().getHours();
    const idx = Math.min(now, (h.time?.length ?? 1) - 1);

    const aqi = h.us_aqi?.[idx] ?? 0;
    const { label, color, advice } = getAqiInfo(aqi);

    return {
      aqi,
      pm25: h.pm2_5?.[idx] ?? 0,
      pm10: h.pm10?.[idx] ?? 0,
      o3: h.ozone?.[idx] ?? 0,
      no2: h.nitrogen_dioxide?.[idx] ?? 0,
      so2: h.sulphur_dioxide?.[idx] ?? 0,
      co: h.carbon_monoxide?.[idx] ?? 0,
      label,
      color,
      advice,
      hourly: (h.time ?? []).map((t: string, i: number) => ({
        time: t,
        aqi: h.us_aqi?.[i] ?? 0,
      })),
    };
  } catch {
    return null;
  }
}

function getAqiInfo(aqi: number): { label: string; color: string; advice: string } {
  if (aqi <= 50) return { label: "Good", color: "text-green-700", advice: "Air quality is satisfactory. Enjoy outdoor activities." };
  if (aqi <= 100) return { label: "Moderate", color: "text-yellow-700", advice: "Acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion." };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "text-orange-700", advice: "Sensitive groups should reduce prolonged or heavy outdoor exertion." };
  if (aqi <= 200) return { label: "Unhealthy", color: "text-red-700", advice: "Everyone should reduce prolonged or heavy outdoor exertion." };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-700", advice: "Everyone should avoid prolonged or heavy outdoor exertion." };
  return { label: "Hazardous", color: "text-rose-900", advice: "Everyone should avoid all outdoor exertion." };
}

export function getAqiEmoji(aqi: number): string {
  if (aqi <= 50) return "🟢";
  if (aqi <= 100) return "🟡";
  if (aqi <= 150) return "🟠";
  if (aqi <= 200) return "🔴";
  if (aqi <= 300) return "🟣";
  return "🟤";
}
