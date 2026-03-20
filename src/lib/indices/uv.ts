import type { LifeIndexResult } from "@/types";

export function uvIndexScore(uvIndex: number): LifeIndexResult {
  const score = Math.min(10, Math.round(uvIndex));
  if (uvIndex >= 11) return { score: 10, label: "Extreme - avoid sun" };
  if (uvIndex >= 8) return { score: 8, label: "Very High - sunscreen essential" };
  if (uvIndex >= 6) return { score: 6, label: "High - hat & sunscreen" };
  if (uvIndex >= 3) return { score: Math.round(uvIndex), label: "Moderate" };
  return { score: Math.round(uvIndex), label: "Low" };
}
