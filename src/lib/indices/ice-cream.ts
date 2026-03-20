import type { LifeIndexResult } from "@/types";

export function iceCreamIndex(
  date: string,
  averageTemperature: number,
  sunshineHours: number
): LifeIndexResult {
  if (!isInSeason(date, [3, 4, 5, 6, 7, 8])) {
    return {
      score: 0,
      label: "Back in season when sunny days return",
      seasonal: true,
      inSeason: false
    };
  }

  const score = clampScore(averageTemperature / 3 + sunshineHours / 1.5);

  if (score >= 8) return { score, label: "Peak ice cream weather", seasonal: true, inSeason: true };
  if (score >= 6) return { score, label: "A very scoopable day", seasonal: true, inSeason: true };
  if (score >= 4) return { score, label: "Dessert weather if the sun appears", seasonal: true, inSeason: true };
  return { score, label: "Probably not an ice cream day", seasonal: true, inSeason: true };
}

function isInSeason(date: string, months: number[]) {
  return months.includes(new Date(`${date}T00:00:00Z`).getUTCMonth());
}

function clampScore(value: number) {
  return Math.max(0, Math.min(10, Math.round(value)));
}
