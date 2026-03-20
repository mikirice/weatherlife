const RAINVIEWER_API = "https://api.rainviewer.com/public/weather-maps.json";

export interface RainViewerData {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: Array<{ time: number; path: string }>;
    nowcast: Array<{ time: number; path: string }>;
  };
  satellite: {
    infrared: Array<{ time: number; path: string }>;
  };
}

export async function fetchRainViewerData(): Promise<RainViewerData> {
  const res = await fetch(RAINVIEWER_API, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("RainViewer API failed");
  return res.json();
}

export function getRainViewerTileUrl(path: string, colorScheme = 2, smooth = 1, snow = 1): string {
  return `https://tilecache.rainviewer.com${path}/256/{z}/{x}/{y}/${colorScheme}/${smooth}_${snow}.png`;
}
