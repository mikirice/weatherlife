"use client";

import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";

export function SettingsPanel() {
  const { user, profile, refreshViewer } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const preferences = profile?.preferences;

  async function handlePreferenceSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/profile/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pollen_alert: formData.get("pollen_alert") === "on",
        runner: formData.get("runner") === "on",
        cyclist: formData.get("cyclist") === "on",
        units: formData.get("units") === "imperial" ? "imperial" : "metric"
      })
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsSaving(false);

    if (!response.ok) {
      setMessage(data?.error ?? "Unable to update settings.");
      return;
    }

    await refreshViewer();
    setMessage("Preferences updated.");
  }

  return (
    <main className="shell pb-12 pt-6">
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[34px] p-8">
          <p className="section-kicker">Preferences</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {user
              ? `Signed in as ${user.email ?? "your account"}.`
              : "Authentication is optional. Sign in only if you want synced preferences."}
          </p>

          <div className="mt-8 rounded-[28px] border border-white/70 bg-white/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Access</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-800">
                  WeatherLife Public
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Free
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              All dashboard indices and planning views are public. Sign in only if you want to keep your preferences
              in sync across visits.
            </p>
          </div>

          {message ? <p className="mt-4 text-sm text-slate-500">{message}</p> : null}
        </div>

        <div className="glass-panel rounded-[34px] p-8">
          <p className="section-kicker">Personalization</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Shape the dashboard around you</h2>

          {!user ? (
            <p className="mt-6 text-sm leading-7 text-slate-600">
              Sign in if you want to save preferences. The public dashboard works without an account.
            </p>
          ) : (
            <form onSubmit={handlePreferenceSubmit} className="mt-6 space-y-5">
              <label className="flex items-center justify-between rounded-[22px] border border-white/70 bg-white/70 px-4 py-4">
                <span>
                  <span className="block font-semibold text-slate-800">Pollen alert</span>
                  <span className="block text-sm text-slate-500">Prioritize pollen risk on the dashboard.</span>
                </span>
                <input
                  type="checkbox"
                  name="pollen_alert"
                  defaultChecked={preferences?.pollen_alert}
                  className="h-5 w-5"
                />
              </label>

              <label className="flex items-center justify-between rounded-[22px] border border-white/70 bg-white/70 px-4 py-4">
                <span>
                  <span className="block font-semibold text-slate-800">Runner</span>
                  <span className="block text-sm text-slate-500">Push exercise conditions to the top.</span>
                </span>
                <input type="checkbox" name="runner" defaultChecked={preferences?.runner} className="h-5 w-5" />
              </label>

              <label className="flex items-center justify-between rounded-[22px] border border-white/70 bg-white/70 px-4 py-4">
                <span>
                  <span className="block font-semibold text-slate-800">Cyclist</span>
                  <span className="block text-sm text-slate-500">Treat outdoor conditions as a higher priority.</span>
                </span>
                <input
                  type="checkbox"
                  name="cyclist"
                  defaultChecked={preferences?.cyclist}
                  className="h-5 w-5"
                />
              </label>

              <div className="rounded-[22px] border border-white/70 bg-white/70 px-4 py-4">
                <p className="font-semibold text-slate-800">Units</p>
                <div className="mt-4 flex gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="radio"
                      name="units"
                      value="metric"
                      defaultChecked={(preferences?.units ?? "metric") === "metric"}
                    />
                    Metric
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="radio"
                      name="units"
                      value="imperial"
                      defaultChecked={preferences?.units === "imperial"}
                    />
                    Imperial
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                Save preferences
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
