"use client";

import dynamic from "next/dynamic";

const WeatherMap = dynamic(
  () => import("@/components/maps/WeatherMap").then((mod) => mod.WeatherMap),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center bg-slate-900 text-white/50 rounded-[20px]">Loading radar...</div> }
);

export { WeatherMap as DynamicWeatherMap };
