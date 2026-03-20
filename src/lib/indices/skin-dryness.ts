import type { LifeIndexResult } from "@/types";

export function skinDrynessIndex(humidity: number, windSpeed: number): LifeIndexResult {
  const humidityRisk = humidity < 25 ? 6 : humidity < 35 ? 4 : humidity < 45 ? 2 : 0;
  const windRisk = windSpeed >= 10 ? 4 : windSpeed >= 7 ? 3 : windSpeed >= 4 ? 1 : 0;
  const score = Math.max(0, Math.min(10, humidityRisk + windRisk));

  if (score >= 8) return { score, label: "High dryness risk, moisturize early" };
  if (score >= 5) return { score, label: "Skin may dry out today" };
  if (score >= 3) return { score, label: "A little extra hydration helps" };
  return { score, label: "Low dryness risk" };
}
