const NHC_CURRENT_STORMS = "https://www.nhc.noaa.gov/CurrentStorms.json";

export interface NHCStorm {
  id: string;
  binNumber: string;
  name: string;
  classification: string;
  intensity: string;
  pressure: string;
  latitude: number;
  longitude: number;
  latitudeNumeric: number;
  longitudeNumeric: number;
  movementDir: string;
  movementSpeed: number;
  lastUpdate: string;
  publicAdvisory: { url: string } | null;
  forecastGraphics: { url: string } | null;
  windSpeedProbabilities: { url: string } | null;
}

export interface NHCResponse {
  activeStorms: NHCStorm[] | null;
}

export async function fetchActiveStorms(): Promise<NHCStorm[]> {
  try {
    const res = await fetch(NHC_CURRENT_STORMS, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data: NHCResponse = await res.json();
    return data.activeStorms ?? [];
  } catch {
    return [];
  }
}

export function getStormCategory(classification: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  const cl = classification.toUpperCase();
  if (cl.includes("HURRICANE") || cl.includes("TYPHOON")) {
    return { label: "Hurricane", color: "text-red-700", bgColor: "bg-red-100" };
  }
  if (cl.includes("TROPICAL STORM")) {
    return { label: "Tropical Storm", color: "text-amber-700", bgColor: "bg-amber-100" };
  }
  if (cl.includes("TROPICAL DEPRESSION") || cl.includes("TD")) {
    return { label: "Tropical Depression", color: "text-slate-600", bgColor: "bg-slate-100" };
  }
  if (cl.includes("POST-TROPICAL") || cl.includes("REMNANT")) {
    return { label: "Post-Tropical", color: "text-blue-600", bgColor: "bg-blue-100" };
  }
  return { label: classification, color: "text-slate-600", bgColor: "bg-slate-100" };
}
