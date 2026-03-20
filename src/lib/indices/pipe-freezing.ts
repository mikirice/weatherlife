import type { LifeIndexResult } from "@/types";

export function pipeFreezingIndex(minTemperature: number): LifeIndexResult {
  let score = 0;

  if (minTemperature <= -8) score = 10;
  else if (minTemperature <= -5) score = 8;
  else if (minTemperature <= -2) score = 6;
  else if (minTemperature < 0) score = 4;
  else if (minTemperature < 2) score = 2;

  if (score >= 8) return { score, label: "Protect exposed pipes tonight" };
  if (score >= 5) return { score, label: "Freezing risk is real" };
  if (score >= 2) return { score, label: "Watch colder corners and outdoor taps" };
  return { score, label: "No freezing concern" };
}
