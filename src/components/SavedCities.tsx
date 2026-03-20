"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import type { SavedLocation } from "@/types";

export function SavedCities({
  currentCity
}: {
  currentCity: SavedLocation;
}) {
  const { user, profile, isPro, refreshViewer } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const savedLocations = profile?.saved_locations ?? [];
  const isSaved = savedLocations.some((item) => item.slug === currentCity.slug);

  async function handleSave() {
    setStatus(null);

    const response = await fetch("/api/profile/saved-cities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(currentCity)
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setStatus(data?.error ?? "Unable to save city.");
      return;
    }

    setStatus("Saved.");
    await refreshViewer();
  }

  async function handleRemove(slug: string) {
    setStatus(null);

    const response = await fetch(`/api/profile/saved-cities?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE"
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setStatus(data?.error ?? "Unable to remove city.");
      return;
    }

    setStatus("Removed.");
    await refreshViewer();
  }

  return (
    <aside className="glass-panel rounded-[32px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Saved cities</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Keep up to five dashboards on hand</h2>
        </div>
        {isPro ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Pro
          </span>
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        {savedLocations.length > 0 ? (
          savedLocations.map((city) => (
            <div
              key={city.slug}
              className="flex items-center justify-between rounded-[22px] border border-white/70 bg-white/65 px-4 py-3"
            >
              <div>
                <Link href={`/${city.slug}`} className="text-sm font-semibold text-slate-800">
                  {city.name}
                </Link>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{city.country}</p>
              </div>
              {isPro ? (
                <button
                  type="button"
                  onClick={() => void handleRemove(city.slug)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-300 bg-white/40 px-4 py-5 text-sm text-slate-500">
            {user ? "No saved cities yet." : "Log in and upgrade to save cities."}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[24px] border border-white/70 bg-white/72 p-4">
        <p className="text-sm font-medium text-slate-700">Current city</p>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-800">{currentCity.name}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{currentCity.country}</p>
          </div>
          {isPro ? (
            <button
              type="button"
              onClick={() => void (isSaved ? handleRemove(currentCity.slug) : handleSave())}
              className="rounded-full bg-[linear-gradient(135deg,#195f7d,#2ea488)] px-4 py-2 text-sm font-semibold text-white"
            >
              {isSaved ? "Remove city" : "Save city"}
            </button>
          ) : (
            <Link
              href={user ? "/settings" : "/login"}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Unlock
            </Link>
          )}
        </div>
      </div>

      {status ? <p className="mt-4 text-sm text-slate-500">{status}</p> : null}
    </aside>
  );
}
