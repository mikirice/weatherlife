import type { LifeIndexResult } from "@/types";

const labels = [
  "None",
  "None",
  "Very Low",
  "Low",
  "Moderate",
  "Moderate",
  "High",
  "High",
  "Very High",
  "Very High",
  "Extreme"
];

export function pollenIndex(upi: number, inSeason: boolean, available = true): LifeIndexResult {
  if (!available) {
    return { score: 0, label: "Pollen data unavailable" };
  }
  if (!inSeason) {
    return { score: 0, label: "No pollen season" };
  }

  const score = Math.max(0, Math.min(10, Math.round(upi * 2)));
  return { score, label: labels[score] };
}
