"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CitySearch } from "@/components/CitySearch";
import { cities } from "@/lib/cities";
import { findNearestCity } from "@/lib/geo";
import { lifeIndexIcons } from "@/components/icons/LifeIndexIcons";
import { lifeIndexMeta } from "@/lib/indices";

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"locating" | "fallback" | "error">("locating");
  const [message, setMessage] = useState("Finding the closest city for your morning snapshot...");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("fallback");
      setMessage("Geolocation is unavailable in this browser. Pick a city below.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestCity(position.coords.latitude, position.coords.longitude);
        router.replace(`/${nearest.slug}`);
      },
      () => {
        setStatus("fallback");
        setMessage("Location access was skipped. Choose a city to continue.");
      },
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 60 * 60 * 1000
      }
    );
  }, [router]);

  return (
    <main className="shell pb-12 pt-8">
      {/* Hero */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="section-kicker">WeatherLife</p>
          <h1 className="display-title mt-4 max-w-2xl text-4xl font-bold text-gray-900 md:text-6xl">
            Weather, translated into today&apos;s decisions.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-gray-600">
            Check clothing, laundry, umbrella, pollen, and comfort indices for 50 cities worldwide — all in one free dashboard.
          </p>

          <div className="mt-8 max-w-xl">
            <CitySearch cities={cities} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <Link
              href="/about"
              className="rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800"
            >
              About WeatherLife
            </Link>
            <Link
              href="/cities"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Browse all cities
            </Link>
            {["Tokyo", "London", "New York", "Sydney"].map((name) => {
              const city = cities.find((item) => item.name === name);
              if (!city) {
                return null;
              }

              return (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  {city.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <p className="section-kicker">Auto-detect</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Open the right city first</h2>
          <p className="mt-3 text-sm text-gray-600">{message}</p>

          <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <p className="text-sm font-medium text-gray-700">
                {status === "locating" ? "Requesting browser location" : "Search available"}
              </p>
            </div>
            <dl className="mt-5 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <dt>Clothing advice</dt>
                <dd className="font-medium text-gray-900">👕</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Umbrella & rain</dt>
                <dd className="font-medium text-gray-900">☂️</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Pollen & UV</dt>
                <dd className="font-medium text-gray-900">👃 ☀️</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Exercise & comfort</dt>
                <dd className="font-medium text-gray-900">🏃 💧</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-16">
        <div className="text-center">
          <p className="section-kicker">How it works</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Three steps to a smarter morning
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Find your city",
              description: "Search from 50 cities worldwide, or let your browser detect the nearest one automatically.",
              accent: "bg-teal-50 text-teal-700 border-teal-200"
            },
            {
              step: "2",
              title: "Check the indices",
              description: "See 16 life indices — from clothing and umbrella to pollen, UV, and comfort — scored 0 to 10.",
              accent: "bg-sky-50 text-sky-700 border-sky-200"
            },
            {
              step: "3",
              title: "Plan your day",
              description: "Use clear labels and scores to decide what to wear, when to exercise, or whether to do laundry.",
              accent: "bg-amber-50 text-amber-700 border-amber-200"
            }
          ].map((item) => (
            <div
              key={item.step}
              className="glass-panel rounded-xl p-6"
            >
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold ${item.accent}`}>
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Index preview grid */}
      <section className="mt-16">
        <div className="text-center">
          <p className="section-kicker">16 Life Indices</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Everything you need, at a glance
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
            Each index translates raw weather data into a practical 0-10 score with a human-readable label.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {lifeIndexMeta.map((meta) => {
            const IconComponent = lifeIndexIcons[meta.key];
            const colorMap: Record<string, string> = {
              clothing: "text-violet-500 bg-violet-50",
              umbrella: "text-blue-500 bg-blue-50",
              pollen: "text-yellow-600 bg-yellow-50",
              laundry: "text-cyan-500 bg-cyan-50",
              uv: "text-orange-500 bg-orange-50",
              coldRisk: "text-sky-500 bg-sky-50",
              exercise: "text-emerald-500 bg-emerald-50",
              comfort: "text-teal-500 bg-teal-50",
              stargazing: "text-indigo-500 bg-indigo-50",
              carWash: "text-blue-500 bg-blue-50",
              skinDryness: "text-rose-500 bg-rose-50",
              pipeFreezing: "text-slate-500 bg-slate-50",
              heatingCooling: "text-red-500 bg-red-50",
              nabe: "text-orange-500 bg-orange-50",
              beer: "text-amber-500 bg-amber-50",
              iceCream: "text-pink-500 bg-pink-50"
            };
            const colors = colorMap[meta.key] ?? "text-gray-500 bg-gray-50";
            const [textColor, bgColor] = colors.split(" ");

            return (
              <div
                key={meta.key}
                className="glass-panel flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all hover:shadow-md"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgColor}`}>
                  {IconComponent ? (
                    <span className={textColor}>
                      <IconComponent size={20} />
                    </span>
                  ) : (
                    <span className="text-base">{meta.icon}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{meta.title}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {meta.tier === "pro" ? "Pro" : "Free"} ·{" "}
                    {meta.direction === "higher" ? "Higher is better" : meta.direction === "lower" ? "Lower is better" : "Guidance"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 text-center">
        <div className="glass-panel mx-auto max-w-2xl rounded-xl bg-teal-50/40 p-8">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
            Start your weather-informed day
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
            Pick a city above, or browse all 50 supported locations to find yours.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/cities"
              className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
            >
              Browse all cities
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
