import Link from "next/link";

import { CitySearch } from "@/components/CitySearch";
import { cities } from "@/lib/cities";
import type { ViewerState } from "@/types";

export function Header({ viewer: _viewer }: { viewer: ViewerState }) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-sm">
      <div className="shell py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="min-w-fit">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
                WL
              </span>
              <div>
                <p className="text-lg font-semibold tracking-tight">WeatherLife</p>
              </div>
            </div>
          </Link>

          <div className="ml-auto w-full max-w-md">
            <CitySearch cities={cities} />
          </div>

          <div className="flex w-full justify-end md:w-auto">
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/radar"
                className="rounded-lg px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Radar
              </Link>
              <Link
                href="/storms"
                className="rounded-lg px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Storms
              </Link>
              <Link
                href="/alerts"
                className="rounded-lg px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Alerts
              </Link>
              <Link
                href="/air-quality"
                className="rounded-lg px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Air
              </Link>
              <Link
                href="/cities"
                className="rounded-lg px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Cities
              </Link>
              <Link
                href="/about"
                className="rounded-lg px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
