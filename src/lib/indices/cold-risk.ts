import type { LifeIndexResult } from "@/types";

export function coldRiskIndex(temp: number, humidity: number, tempDiff: number): LifeIndexResult {
  let score = 0;
  score += temp < 5 ? 3 : temp < 10 ? 2 : temp < 15 ? 1 : 0;
  score += humidity < 30 ? 3 : humidity < 40 ? 2 : humidity < 50 ? 1 : 0;
  score += tempDiff > 15 ? 4 : tempDiff > 10 ? 3 : tempDiff > 7 ? 2 : tempDiff > 5 ? 1 : 0;

  score = Math.min(10, score);
  if (score >= 8) return { score, label: "High risk - stay warm!" };
  if (score >= 5) return { score, label: "Moderate risk - dress warmly" };
  if (score >= 3) return { score, label: "Low risk" };
  return { score, label: "Very low risk" };
}
