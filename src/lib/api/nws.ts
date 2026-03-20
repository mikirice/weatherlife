export interface NWSAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  urgency: string;
  certainty: string;
  areaDesc: string;
  effective: string;
  expires: string;
  senderName: string;
}

export async function fetchNWSAlerts(lat: number, lon: number): Promise<NWSAlert[]> {
  try {
    const res = await fetch(
      `https://api.weather.gov/alerts?point=${lat},${lon}&status=actual&limit=10`,
      {
        headers: { "User-Agent": "WeatherLife (weatherlife.vercel.app)" },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features ?? []).map((f: { properties: NWSAlert }) => f.properties);
  } catch {
    return [];
  }
}

export interface GDACSEvent {
  title: string;
  description: string;
  link: string;
  alertLevel: string;
  eventType: string;
  country: string;
  pubDate: string;
}

export async function fetchGDACSAlerts(): Promise<GDACSEvent[]> {
  try {
    const res = await fetch("https://www.gdacs.org/xml/rss.xml", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const text = await res.text();
    return parseGDACSXml(text);
  } catch {
    return [];
  }
}

function parseGDACSXml(xml: string): GDACSEvent[] {
  const events: GDACSEvent[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = extractTag(item, "title");
    const description = extractTag(item, "description");
    const link = extractTag(item, "link");
    const pubDate = extractTag(item, "pubDate");
    const alertLevel = extractTag(item, "gdacs:alertlevel") || extractTag(item, "alertlevel") || "Unknown";
    const eventType = extractTag(item, "gdacs:eventtype") || extractTag(item, "eventtype") || "";
    const country = extractTag(item, "gdacs:country") || extractTag(item, "country") || "";

    if (title) {
      events.push({ title, description, link, alertLevel, eventType, country, pubDate });
    }
  }

  return events.slice(0, 10);
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "s");
  const match = regex.exec(xml);
  return match?.[1]?.trim() ?? "";
}

export function getSeverityStyle(severity: string): { color: string; bgColor: string; icon: string } {
  switch (severity) {
    case "Extreme": return { color: "text-red-800", bgColor: "bg-red-100", icon: "🔴" };
    case "Severe": return { color: "text-orange-800", bgColor: "bg-orange-100", icon: "🟠" };
    case "Moderate": return { color: "text-amber-800", bgColor: "bg-amber-100", icon: "🟡" };
    case "Minor": return { color: "text-blue-800", bgColor: "bg-blue-100", icon: "🔵" };
    default: return { color: "text-slate-600", bgColor: "bg-slate-100", icon: "⚪" };
  }
}
