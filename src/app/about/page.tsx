import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "WeatherLife translates raw weather data into 16 practical life indices — clothing, umbrella, pollen, UV, laundry, comfort, and more — so you can plan your day in seconds.",
  alternates: {
    canonical: "/about"
  },
  openGraph: {
    title: `About | ${siteConfig.name}`,
    description:
      "How WeatherLife turns weather into actionable daily life indices for 50 cities worldwide.",
    url: absoluteUrl("/about"),
    type: "website",
    images: [{ url: "/api/og?city=tokyo", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: `About | ${siteConfig.name}`,
    images: ["/api/og?city=tokyo"]
  }
};

export default function AboutPage() {
  return (
    <main className="shell pb-12 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-xl p-8">
          <p className="section-kicker">About WeatherLife</p>
          <h1 className="display-title mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Weather, translated into everyday choices.
          </h1>
          <p className="mt-5 text-base leading-7 text-gray-600">
            WeatherLife is a public weather dashboard built around life indices: simple scores that tell you what
            to wear, whether to bring an umbrella, if laundry will dry well, how intense pollen may feel, and how
            comfortable the day looks overall.
          </p>
          <p className="mt-4 text-base leading-7 text-gray-600">
            The idea is inspired by Japanese weather culture, where forecasts often include practical indices for
            daily decisions. WeatherLife adapts that habit into English for cities around the world.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-8">
          <p className="section-kicker">How to use it</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-gray-600">
            <p>Open your city page in the morning to get sixteen weather-linked lifestyle scores in one glance.</p>
            <p>Higher is better for some indices like laundry and exercise. Lower is better for indices like umbrella, UV, and pollen.</p>
            <p>Seasonal indices such as nabe, beer, and ice cream stay visible so the dashboard reflects the mood of the time of year.</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cities"
              className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
            >
              Browse cities
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
