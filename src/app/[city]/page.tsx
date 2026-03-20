import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Dashboard } from "@/components/Dashboard";
import { HourlyForecast } from "@/components/HourlyForecast";
import { HourlyInsights, ProForecastTable } from "@/components/ProForecastTable";
import { RadarMiniMap } from "@/components/maps/RadarMiniMap";
import { getCityBySlug, cities } from "@/lib/cities";
import {
  getWeatherDescription,
  getWeatherEmoji
} from "@/lib/api/open-meteo";
import { getCachedDashboardSnapshot } from "@/lib/api/cache";
import { getViewerState } from "@/lib/profile";
import {
  buildCityStructuredData,
  getCityOgImageUrl,
  getCityPageDescription,
  getCityPageTitle
} from "@/lib/site";

export const revalidate = 3600;

type CityPageProps = {
  params: Promise<{
    city: string;
  }>;
};

export async function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getCityBySlug(resolvedParams.city);

  if (!city) {
    return {
      title: "City not found | WeatherLife"
    };
  }

  const title = getCityPageTitle(city.name);
  const description = getCityPageDescription(city);
  const ogImage = getCityOgImageUrl(city.slug);

  return {
    title,
    description,
    alternates: {
      canonical: `/${city.slug}`
    },
    openGraph: {
      title,
      description,
      url: `/${city.slug}`,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${city.name} WeatherLife card`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const resolvedParams = await params;
  const city = getCityBySlug(resolvedParams.city);

  if (!city) {
    notFound();
  }

  const snapshot = await getCachedDashboardSnapshot({
    lat: city.lat,
    lon: city.lon,
    timezone: city.timezone
  });
  const viewer = await getViewerState();

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeZone: city.timezone
  }).format(new Date());

  const updatedAt = new Intl.DateTimeFormat("en-US", {
    timeStyle: "short",
    timeZone: city.timezone
  }).format(new Date(snapshot.fetchedAt));

  const weatherLabel = getWeatherDescription(snapshot.current.weatherCode);
  const weatherEmoji = getWeatherEmoji(snapshot.current.weatherCode, snapshot.current.isDay);
  const structuredData = buildCityStructuredData({
    city,
    snapshot,
    weatherLabel
  });

  return (
    <main className="shell pb-12 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="glass-panel overflow-hidden rounded-xl p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">{formattedDate}</p>
              <h1 className="display-title mt-3 text-4xl font-bold text-gray-900 md:text-6xl">{city.name}</h1>
              <p className="mt-2 text-base text-gray-500">{city.country}</p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Updated</p>
              <p className="mt-1 text-sm font-medium text-gray-700">{updatedAt} local time</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-xl bg-teal-800 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-teal-200">Current weather</p>
                  <div className="mt-4 flex items-end gap-4">
                    <span className="text-5xl leading-none">{weatherEmoji}</span>
                    <div>
                      <p className="text-5xl font-bold tracking-tight">{Math.round(snapshot.current.temperature)}°</p>
                      <p className="mt-2 text-sm text-teal-200">{weatherLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-white/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-wider text-teal-200">Feels like</p>
                  <p className="mt-1 text-3xl font-bold">{Math.round(snapshot.current.apparentTemperature)}°</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricCard label="Humidity" value={`${snapshot.current.humidity}%`} />
                <MetricCard label="Wind" value={`${Math.round(snapshot.current.windSpeed)} m/s`} />
                <MetricCard label="Pollen" value={snapshot.pollen.category} />
              </div>
            </div>

            <div className="grid gap-4">
              <aside className="glass-panel rounded-xl p-6">
                <p className="section-kicker">Day profile</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">What the day leans toward</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <dt className="text-gray-500">Rain chance</dt>
                    <dd className="font-semibold text-gray-900">{snapshot.summary.maxPrecipitationProbability}%</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <dt className="text-gray-500">Sunshine</dt>
                    <dd className="font-semibold text-gray-900">{snapshot.summary.sunshineHours} h</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <dt className="text-gray-500">UV peak</dt>
                    <dd className="font-semibold text-gray-900">{snapshot.summary.maxUvIndex}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Temp swing</dt>
                    <dd className="font-semibold text-gray-900">{snapshot.summary.temperatureRange}°</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </div>

        {/* Right sidebar: radar + updated info */}
        <div className="hidden xl:flex xl:flex-col xl:gap-5">
          <RadarMiniMap lat={city.lat} lon={city.lon} citySlug={city.slug} />
          <div className="glass-panel rounded-xl p-5">
            <p className="section-kicker">Quick links</p>
            <div className="mt-3 flex flex-col gap-1.5 text-sm">
              <a href={`/${city.slug}/radar`} className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><circle cx="12" cy="12" r="10"/><path d="M12 12l6-3"/><path d="M12 2a10 10 0 0 1 0 20"/><circle cx="12" cy="12" r="4"/></svg>
                Full Radar Map
              </a>
              <a href="/storms" className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5.5 4 8h6c2-2.5 4-5 4-8a7 7 0 0 0-7-7z"/><path d="M9 17l1.5 4h3L15 17"/></svg>
                Storm Tracker
              </a>
              <a href="/alerts" className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Weather Alerts
              </a>
              <a href="/air-quality" className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M9.59 4.59A2 2 0 1 1 11 8H2"/><path d="M12.59 19.41A2 2 0 1 0 14 16H2"/><path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2"/></svg>
                Air Quality
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-teal-50/40 p-5">
        <div className="mb-4 px-1">
          <p className="section-kicker">Today's life indices</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Sixteen practical scores for the day ahead</h2>
        </div>
        <Dashboard
          indices={snapshot.indices}
          preferences={viewer.profile?.preferences ?? null}
        />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] rounded-xl bg-slate-50/50 p-5">
        <HourlyForecast items={snapshot.hourly} />

        <aside className="glass-panel rounded-xl p-6">
          <p className="section-kicker">Interpretation</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">How to read the scale</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-gray-600">
            <p>Scores run from 0 to 10. For umbrella, pollen, UV, and cold risk, lower is better. For laundry, exercise, and comfort, higher is better.</p>
            <p>Clothing and heating/cooling are guidance scales rather than strict good-or-bad scores, so the label is the primary signal.</p>
            <p>Seasonal cards stay visible year-round and explicitly show when they are out of season.</p>
          </div>
        </aside>
      </section>

      <section className="mt-5 xl:hidden">
        <RadarMiniMap lat={city.lat} lon={city.lon} citySlug={city.slug} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <HourlyInsights insights={snapshot.hourlyInsights} />
        <ProForecastTable forecast={snapshot.forecast} />
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-teal-200">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
