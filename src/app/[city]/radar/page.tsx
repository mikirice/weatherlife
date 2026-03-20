import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { DynamicWeatherMap } from "@/components/maps/DynamicWeatherMap";
import { getCityBySlug, cities } from "@/lib/cities";
import { siteConfig } from "@/lib/site";

type CityRadarProps = {
  params: Promise<{ city: string }>;
};

export async function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: CityRadarProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "Not found" };

  return {
    title: `${city.name} Radar & Weather Map | ${siteConfig.name}`,
    description: `Live precipitation radar and weather maps for ${city.name}, ${city.country}.`,
  };
}

export default async function CityRadarPage({ params }: CityRadarProps) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  return (
    <main className="shell pb-8 pt-4">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Live radar</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{city.name} Weather Map</h1>
          <p className="mt-1 text-sm text-slate-500">{city.country}</p>
        </div>
        <Link
          href={`/${city.slug}`}
          className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
        >
          ← Dashboard
        </Link>
      </div>
      <DynamicWeatherMap className="h-[75vh]" zoom={8} center={[city.lat, city.lon]} />
    </main>
  );
}
