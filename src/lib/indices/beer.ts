import type { LifeIndexResult } from "@/types";

export function beerIndex(
  date: string,
  averageTemperature: number,
  averageHumidity: number
): LifeIndexResult {
  if (!isInSeason(date, [3, 4, 5, 6, 7, 8])) {
    return {
      score: 0,
      label: "Back in season when spring warms up",
      seasonal: true,
      inSeason: false
    };
  }

  const score = clampScore(averageTemperature / 3 + Math.max(0, 70 - averageHumidity) / 20);

  if (score >= 8) return { score, label: "Excellent beer weather", seasonal: true, inSeason: true };
  if (score >= 6) return { score, label: "A solid cold one kind of day", seasonal: true, inSeason: true };
  if (score >= 4) return { score, label: "Nice enough for patio drinks", seasonal: true, inSeason: true };
  return { score, label: "Not especially beer-driven weather", seasonal: true, inSeason: true };
}

function isInSeason(date: string, months: number[]) {
  return months.includes(new Date(`${date}T00:00:00Z`).getUTCMonth());
}

function clampScore(value: number) {
  return Math.max(0, Math.min(10, Math.round(value)));
}
