import type { Metadata } from "next";
import Link from "next/link";

import { cities } from "@/lib/cities";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Cities",
  description: `Browse all ${cities.length} city dashboards on WeatherLife — daily clothing, umbrella, pollen, UV, laundry, and comfort indices for cities across Asia, Europe, the Americas, Africa, and Oceania.`,
  alternates: {
    canonical: "/cities"
  },
  openGraph: {
    title: `All ${cities.length} Cities | ${siteConfig.name}`,
    description: `Browse daily weather life indices for ${cities.length} cities worldwide.`,
    url: absoluteUrl("/cities"),
    type: "website",
    images: [{ url: "/api/og?city=london", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: `All ${cities.length} Cities | ${siteConfig.name}`,
    images: ["/api/og?city=london"]
  }
};

export default function CitiesPage() {
  return (
    <main className="shell pb-12 pt-8">
      <section>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">City directory</p>
            <h1 className="display-title mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Fifty city dashboards, one weather language.
            </h1>
          </div>
          <p className="max-w-md text-sm leading-7 text-gray-600">
            Browse WeatherLife by city and jump straight into the local dashboard for clothing, umbrella, laundry,
            pollen, UV, and the rest of the daily indices.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="glass-panel rounded-xl p-5 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{city.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">{city.country}</p>
                </div>
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                  {city.timezone.split("/").pop()?.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Population</span>
                <span className="font-medium text-gray-700">
                  {city.population ? Intl.NumberFormat("en-US", { notation: "compact" }).format(city.population) : "n/a"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
