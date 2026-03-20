import type { Metadata } from "next";

import { fetchAirQuality, getAqiEmoji } from "@/lib/api/air-quality";
import { cities } from "@/lib/cities";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Air Quality Index | ${siteConfig.name}`,
  description: "Check real-time air quality index (AQI), PM2.5, PM10, ozone, and pollutant levels for cities worldwide.",
};

const FEATURED_CITIES = ["tokyo", "new-york", "london", "paris", "beijing", "sydney", "mumbai", "seoul", "berlin", "los-angeles", "bangkok", "cairo"];

export default async function AirQualityPage() {
  const featured = cities.filter((c) => FEATURED_CITIES.includes(c.slug));

  const results = await Promise.all(
    featured.map(async (city) => {
      const aq = await fetchAirQuality(city.lat, city.lon);
      return { city, aq };
    })
  );

  return (
    <main className="shell pb-12 pt-6">
      <div className="mb-6">
        <p className="section-kicker">Air quality</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Air Quality Index</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time AQI and pollutant levels from Open-Meteo. Data updates hourly.
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {results.map(({ city, aq }) => (
          <article key={city.slug} className="glass-panel rounded-[20px] p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">{city.name}</h3>
                <p className="text-xs text-slate-400">{city.country}</p>
              </div>
              {aq && <span className="text-lg">{getAqiEmoji(aq.aqi)}</span>}
            </div>

            {aq ? (
              <>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${aq.color}`}>{aq.aqi}</span>
                  <span className={`text-xs font-medium ${aq.color}`}>{aq.label}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[0.65rem]">
                  <div className="rounded-lg bg-white/50 px-2 py-1">
                    <span className="text-slate-400">PM2.5</span>
                    <span className="ml-1 font-semibold text-slate-700">{Math.round(aq.pm25)}</span>
                  </div>
                  <div className="rounded-lg bg-white/50 px-2 py-1">
                    <span className="text-slate-400">PM10</span>
                    <span className="ml-1 font-semibold text-slate-700">{Math.round(aq.pm10)}</span>
                  </div>
                  <div className="rounded-lg bg-white/50 px-2 py-1">
                    <span className="text-slate-400">O₃</span>
                    <span className="ml-1 font-semibold text-slate-700">{Math.round(aq.o3)}</span>
                  </div>
                  <div className="rounded-lg bg-white/50 px-2 py-1">
                    <span className="text-slate-400">NO₂</span>
                    <span className="ml-1 font-semibold text-slate-700">{Math.round(aq.no2)}</span>
                  </div>
                </div>

                <p className="mt-2 text-[0.6rem] leading-4 text-slate-500">{aq.advice}</p>
              </>
            ) : (
              <p className="mt-3 text-xs text-slate-400">Data unavailable</p>
            )}
          </article>
        ))}
      </div>

      <div className="mt-8 glass-panel rounded-[28px] p-6">
        <p className="section-kicker">Scale reference</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">US EPA AQI Scale</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-3 text-xs">
          {[
            { range: "0–50", label: "Good", emoji: "🟢", desc: "No health concern" },
            { range: "51–100", label: "Moderate", emoji: "🟡", desc: "Sensitive individuals may be affected" },
            { range: "101–150", label: "Unhealthy (Sensitive)", emoji: "🟠", desc: "Sensitive groups reduce outdoor exertion" },
            { range: "151–200", label: "Unhealthy", emoji: "🔴", desc: "Everyone reduce outdoor exertion" },
            { range: "201–300", label: "Very Unhealthy", emoji: "🟣", desc: "Everyone avoid outdoor exertion" },
            { range: "301+", label: "Hazardous", emoji: "🟤", desc: "Avoid all outdoor activity" },
          ].map((item) => (
            <div key={item.range} className="flex items-center gap-2 rounded-[12px] bg-white/50 px-3 py-2">
              <span>{item.emoji}</span>
              <div>
                <p className="font-semibold text-slate-700">{item.range} — {item.label}</p>
                <p className="text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
