import type { Metadata } from "next";

import { DynamicWeatherMap } from "@/components/maps/DynamicWeatherMap";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Live Radar & Weather Map | ${siteConfig.name}`,
  description: "Real-time precipitation radar, temperature, wind, cloud, and pressure maps powered by RainViewer and OpenWeatherMap.",
};

export default function RadarPage() {
  return (
    <main className="shell pb-8 pt-4">
      <div className="mb-4">
        <p className="section-kicker">Live radar</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Global Weather Map</h1>
        <p className="mt-1 text-sm text-slate-500">
          Precipitation radar, temperature, wind, clouds, and pressure. Switch layers with the panel on the right.
        </p>
      </div>
      <DynamicWeatherMap className="h-[75vh]" zoom={4} center={[30, 0]} useGeolocation />
    </main>
  );
}
