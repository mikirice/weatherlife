import type { LifeIndexResult } from "@/types";

export function heatingCoolingIndex(averageTemperature: number): LifeIndexResult {
  if (averageTemperature <= 5) return { score: 10, label: "Heavy heating day" };
  if (averageTemperature <= 10) return { score: 8, label: "Heating strongly recommended" };
  if (averageTemperature <= 15) return { score: 6, label: "Keep the heat on" };
  if (averageTemperature < 22) return { score: 3, label: "No major heating or cooling needed" };
  if (averageTemperature < 28) return { score: 6, label: "Cooling may feel nice indoors" };
  if (averageTemperature < 32) return { score: 8, label: "Cooling recommended" };
  return { score: 10, label: "Strong cooling day" };
}
