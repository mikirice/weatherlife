import type { LifeIndexResult } from "@/types";

export function carWashIndex(next48HourRainProbability: number): LifeIndexResult {
  const score = clampScore(10 - next48HourRainProbability / 10);

  if (score >= 8) return { score, label: "Clean it now, rain looks unlikely" };
  if (score >= 6) return { score, label: "Probably safe for a wash" };
  if (score >= 4) return { score, label: "Borderline, watch the radar" };
  return { score, label: "Rain likely soon, skip the wash" };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(10, Math.round(value)));
}
