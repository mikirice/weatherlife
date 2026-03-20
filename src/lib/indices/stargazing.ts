import type { LifeIndexResult } from "@/types";

export function stargazingIndex(
  cloudCover: number,
  visibility: number,
  date: string
): LifeIndexResult {
  const visibilityKm = visibility / 1000;
  const moonlight = getMoonlightFactor(date);
  const score = clampScore(
    10 - cloudCover / 12 - Math.max(0, 12 - visibilityKm) / 1.5 - moonlight * 2.5
  );

  if (score >= 8) return { score, label: "Excellent skywatching tonight" };
  if (score >= 6) return { score, label: "Good odds for a clear sky" };
  if (score >= 4) return { score, label: "Some stars, some haze" };
  return { score, label: "Clouds or moonlight will wash it out" };
}

function getMoonlightFactor(date: string) {
  const target = new Date(`${date}T00:00:00Z`);
  const synodicMonth = 29.53058867;
  const referenceNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const daysSinceReference = (target.getTime() - referenceNewMoon) / 86400000;
  const phase = ((daysSinceReference / synodicMonth) % 1 + 1) % 1;
  return Math.abs(phase - 0.5) * 2;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(10, Math.round(value)));
}
