import type { LifeIndexResult } from "@/types";

export function nabeIndex(
  date: string,
  averageTemperature: number,
  averageHumidity: number
): LifeIndexResult {
  if (!isInSeason(date, [9, 10, 11, 0, 1, 2])) {
    return {
      score: 0,
      label: "Out of season until autumn",
      seasonal: true,
      inSeason: false
    };
  }

  const score = clampScore(10 - averageTemperature / 3 + averageHumidity / 35);

  if (score >= 8) return { score, label: "Perfect hot pot weather", seasonal: true, inSeason: true };
  if (score >= 6) return { score, label: "A good nabe night", seasonal: true, inSeason: true };
  if (score >= 4) return { score, label: "Could go either way", seasonal: true, inSeason: true };
  return { score, label: "Too mild for hot pot cravings", seasonal: true, inSeason: true };
}

function isInSeason(date: string, months: number[]) {
  return months.includes(new Date(`${date}T00:00:00Z`).getUTCMonth());
}

function clampScore(value: number) {
  return Math.max(0, Math.min(10, Math.round(value)));
}
