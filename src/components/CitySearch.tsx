"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { City } from "@/types";

type CitySearchProps = {
  cities: City[];
  className?: string;
};

export function CitySearch({ cities, className }: CitySearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeSlug = pathname.split("/")[1] ?? "";
  const activeCity = cities.find((city) => city.slug === activeSlug);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const filtered = (deferredQuery ? cities.filter(filterCity(deferredQuery)) : cities).slice(0, 8);

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  const placeholder = activeCity ? `${activeCity.name}, ${activeCity.country}` : "Search city";

  function navigateToCity(slug: string) {
    startTransition(() => {
      router.push(`/${slug}`);
    });
    setOpen(false);
    setQuery("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const exactMatch = cities.find((city) => {
      const normalized = query.trim().toLowerCase();
      return (
        city.slug === normalized ||
        city.name.toLowerCase() === normalized ||
        `${city.name}, ${city.country}`.toLowerCase() === normalized
      );
    });

    if (exactMatch) {
      navigateToCity(exactMatch.slug);
      return;
    }

    if (filtered[0]) {
      navigateToCity(filtered[0].slug);
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
          <span className="text-lg">🔎</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 120);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            aria-label="Search city"
          />
        </div>

        {open && filtered.length > 0 ? (
          <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-[24px] border border-white/70 bg-[rgba(255,251,246,0.96)] p-2 shadow-[0_24px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            {filtered.map((city) => (
              <button
                key={city.slug}
                type="button"
                onMouseDown={() => navigateToCity(city.slug)}
                className="flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left transition-colors hover:bg-slate-100/90"
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-800">{city.name}</span>
                  <span className="block text-xs tracking-[0.16em] text-slate-400 uppercase">
                    {city.country}
                  </span>
                </span>
                <span className="text-xs text-slate-500">{city.timezone.split("/").pop()?.replaceAll("_", " ")}</span>
              </button>
            ))}
          </div>
        ) : null}
      </form>
    </div>
  );
}

function filterCity(query: string) {
  const normalized = query.trim().toLowerCase();

  return (city: City) => {
    const haystack = `${city.name} ${city.country} ${city.slug}`.toLowerCase();
    return haystack.includes(normalized);
  };
}
