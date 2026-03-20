import type { LifeIndexResult } from "@/types";

export function clothingIndex(apparentTemp: number): LifeIndexResult {
  if (apparentTemp >= 30) return { score: 10, label: "Tank top & shorts" };
  if (apparentTemp >= 25) return { score: 8, label: "T-shirt & light pants" };
  if (apparentTemp >= 20) return { score: 7, label: "Long sleeve shirt" };
  if (apparentTemp >= 15) return { score: 5, label: "Light jacket" };
  if (apparentTemp >= 10) return { score: 4, label: "Sweater & jacket" };
  if (apparentTemp >= 5) return { score: 3, label: "Coat & scarf" };
  if (apparentTemp >= 0) return { score: 2, label: "Heavy coat & gloves" };
  return { score: 1, label: "Full winter gear" };
}
