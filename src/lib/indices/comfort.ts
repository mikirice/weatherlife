import type { LifeIndexResult } from "@/types";

export function comfortIndex(apparentTemp: number, humidity: number): LifeIndexResult {
  let score = 10;

  if (apparentTemp > 32 || apparentTemp < 2) score -= 5;
  else if (apparentTemp > 28 || apparentTemp < 8) score -= 3;
  else if (apparentTemp > 25 || apparentTemp < 15) score -= 1;

  if (humidity > 85 || humidity < 25) score -= 4;
  else if (humidity > 75 || humidity < 35) score -= 2;
  else if (humidity > 65 || humidity < 45) score -= 1;

  score = Math.max(1, Math.min(10, score));

  if (score >= 9) return { score, label: "Exceptionally comfortable" };
  if (score >= 7) return { score, label: "Comfortable" };
  if (score >= 5) return { score, label: "Mostly fine" };
  if (score >= 3) return { score, label: "A bit uncomfortable" };
  return { score, label: "Sticky or harsh conditions" };
}
