"use client";

import Link from "next/link";
import { DynamicWeatherMap } from "@/components/maps/DynamicWeatherMap";

interface RadarMiniMapProps {
  lat: number;
  lon: number;
  citySlug: string;
}

export function RadarMiniMap({ lat, lon, citySlug }: RadarMiniMapProps) {
  return (
    <div className="glass-panel overflow-hidden rounded-[28px]">
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="section-kicker">📡 Radar</p>
        <Link
          href={`/${citySlug}/radar`}
          className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
        >
          Full map →
        </Link>
      </div>
      <div className="p-3">
        <DynamicWeatherMap
          center={[lat, lon]}
          zoom={7}
          className="h-[200px]"
          showControls={false}
          mini
        />
      </div>
    </div>
  );
}
