import type { LifeIndexResult } from "@/types";

const labels = [
  "",
  "Indoor drying only",
  "Barely dries",
  "Slow drying",
  "Will dry",
  "Dries OK",
  "Good drying day",
  "Great drying day",
  "Very quick drying",
  "Excellent!",
  "Perfect laundry day!"
];

export function laundryIndex(
  temp: number,
  humidity: number,
  windSpeed: number,
  precipProb: number,
  sunshine: number
): LifeIndexResult {
  if (precipProb >= 50) {
    return { score: 1, label: "Indoor drying only" };
  }

  let score = 0;
  score += temp >= 25 ? 3 : temp >= 20 ? 2.5 : temp >= 15 ? 1.5 : 0.5;
  score += humidity < 40 ? 3 : humidity < 60 ? 2 : humidity < 80 ? 1 : 0;
  score += windSpeed >= 20 ? 2 : windSpeed >= 10 ? 1.5 : windSpeed >= 4 ? 1 : 0.5;
  score += sunshine >= 6 ? 2 : sunshine >= 3 ? 1 : 0;

  const rounded = Math.round(score);
  return { score: rounded, label: labels[rounded] || "Perfect laundry day!" };
}
