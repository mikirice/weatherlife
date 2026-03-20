import type { Metadata } from "next";

import { fetchGDACSAlerts } from "@/lib/api/nws";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Weather Alerts & Warnings | ${siteConfig.name}`,
  description: "Active weather alerts, warnings, and global disaster notifications.",
};

export default async function AlertsPage() {
  const gdacsEvents = await fetchGDACSAlerts();

  return (
    <main className="shell pb-12 pt-6">
      <div className="mb-6">
        <p className="section-kicker">Weather alerts</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Alerts & Warnings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Global disaster alerts from GDACS. City-specific alerts appear on each city dashboard (US coverage via NWS).
        </p>
      </div>

      {gdacsEvents.length > 0 ? (
        <div className="space-y-3">
          {gdacsEvents.map((event, i) => {
            const levelColor =
              event.alertLevel === "Red" ? "border-l-red-500 bg-red-50/50" :
              event.alertLevel === "Orange" ? "border-l-orange-500 bg-orange-50/50" :
              event.alertLevel === "Green" ? "border-l-green-500 bg-green-50/50" :
              "border-l-slate-300 bg-white/50";

            const emoji =
              event.eventType === "EQ" ? "🌍" :
              event.eventType === "TC" ? "🌀" :
              event.eventType === "FL" ? "🌊" :
              event.eventType === "VO" ? "🌋" :
              event.eventType === "DR" ? "☀️" :
              "⚠️";

            return (
              <article
                key={`${event.title}-${i}`}
                className={`rounded-[16px] border-l-4 p-4 backdrop-blur ${levelColor}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">{event.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${
                        event.alertLevel === "Red" ? "bg-red-200 text-red-800" :
                        event.alertLevel === "Orange" ? "bg-orange-200 text-orange-800" :
                        "bg-slate-200 text-slate-600"
                      }`}>
                        {event.alertLevel}
                      </span>
                    </div>
                    {event.country && (
                      <p className="mt-1 text-xs text-slate-500">{event.country}</p>
                    )}
                    {event.description && (
                      <p className="mt-2 text-xs leading-5 text-slate-600 line-clamp-2">{event.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      {event.pubDate && (
                        <span>{new Date(event.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      )}
                      {event.link && (
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:text-teal-800">
                          Details →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-[28px] p-8 text-center">
          <p className="text-5xl">✅</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">No major alerts</h2>
          <p className="mt-3 text-sm text-slate-500">
            No significant global disaster alerts at this time.
          </p>
        </div>
      )}

      <div className="mt-8 glass-panel rounded-[28px] p-6">
        <p className="section-kicker">Coverage</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Alert sources</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-slate-600">
          <div className="rounded-[16px] bg-white/50 p-4">
            <p className="font-semibold text-slate-800">🇺🇸 US Weather Alerts</p>
            <p className="mt-1 text-xs leading-5">NWS alerts are shown on individual city dashboards for US locations. Includes watches, warnings, and advisories.</p>
          </div>
          <div className="rounded-[16px] bg-white/50 p-4">
            <p className="font-semibold text-slate-800">🌍 Global Disasters</p>
            <p className="mt-1 text-xs leading-5">GDACS (Global Disaster Alert and Coordination System) provides earthquake, flood, cyclone, and volcanic alerts worldwide.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
