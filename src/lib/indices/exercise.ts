import type { LifeIndexResult } from "@/types";

export function exerciseIndex(
  apparentTemp: number,
  precipProb: number,
  windSpeed: number,
  uvIndex: number
): LifeIndexResult {
  if (precipProb >= 60) return { score: 1, label: "Indoor workout day" };

  let score = 10;
  if (apparentTemp > 35 || apparentTemp < -5) score -= 5;
  else if (apparentTemp > 30 || apparentTemp < 0) score -= 3;
  else if (apparentTemp > 28 || apparentTemp < 5) score -= 1;

  if (windSpeed > 35) score -= 2;
  else if (windSpeed > 25) score -= 1;

  if (uvIndex > 8) score -= 2;
  if (precipProb >= 40) score -= 2;

  score = Math.max(1, Math.min(10, score));
  if (score >= 8) return { score, label: "Perfect for outdoor exercise!" };
  if (score >= 5) return { score, label: "Good with precautions" };
  return { score, label: "Consider indoor exercise" };
}
