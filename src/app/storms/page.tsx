import type { Metadata } from "next";

import { fetchActiveStorms } from "@/lib/api/nhc";
import { StormCard } from "@/components/storms/StormCard";
import { siteConfig } from "@/lib/site";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: `Hurricane & Typhoon Tracker | ${siteConfig.name}`,
  description: "Track active hurricanes, typhoons, and tropical storms worldwide with real-time data from NOAA National Hurricane Center.",
};

export default async function StormsPage() {
  const storms = await fetchActiveStorms();

  return (
    <main className="shell pb-12 pt-6">
      <div className="mb-6">
        <p className="section-kicker">Storm tracker</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Hurricanes & Tropical Storms</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time tropical cyclone data from NOAA National Hurricane Center.
        </p>
      </div>

      {storms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {storms.map((storm) => (
            <StormCard key={storm.id} storm={storm} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-[28px] p-8 text-center">
          <p className="text-5xl">🌊</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">No active tropical storms</h2>
          <p className="mt-3 mx-auto max-w-lg text-sm leading-7 text-slate-500">
            There are no active tropical cyclones being tracked right now.
            Hurricane season runs June through November in the Atlantic, and
            May through November in the Western Pacific.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs">
            <a
              href="https://www.nhc.noaa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/70 bg-white/75 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-white"
            >
              NOAA NHC →
            </a>
            <a
              href="https://www.metoc.navy.mil/jtwc/jtwc.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/70 bg-white/75 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-white"
            >
              JTWC (W. Pacific) →
            </a>
          </div>
        </div>
      )}

      <div className="mt-8 glass-panel rounded-[28px] p-6">
        <p className="section-kicker">About this data</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Data sources</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Storm data is sourced from the NOAA National Hurricane Center (NHC), which covers
          the Atlantic and Eastern Pacific basins. Data refreshes every 30 minutes.
          For Western Pacific typhoons, refer to the Joint Typhoon Warning Center (JTWC).
        </p>
      </div>
    </main>
  );
}
