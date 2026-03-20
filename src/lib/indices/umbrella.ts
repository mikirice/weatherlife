import { isRainCode } from "@/lib/api/open-meteo";
import type { LifeIndexResult } from "@/types";

export function umbrellaIndex(precipProb: number, weatherCode: number): LifeIndexResult {
  if (isRainCode(weatherCode) || precipProb >= 70) return { score: 10, label: "Bring umbrella!" };
  if (precipProb >= 50) return { score: 7, label: "Umbrella recommended" };
  if (precipProb >= 30) return { score: 4, label: "Foldable umbrella just in case" };
  return { score: 1, label: "No umbrella needed" };
}
