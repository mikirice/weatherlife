import Link from "next/link";

import { IndexCard } from "@/components/IndexCard";
import { lifeIndexMeta } from "@/lib/indices";
import type { LifeIndexKey, LifeIndices, UserPreferences } from "@/types";

export function Dashboard({
  indices,
  preferences
}: {
  indices: LifeIndices;
  preferences?: UserPreferences | null;
}) {
  const highlightKeys = getHighlightKeys(preferences);

  return (
    <div className="space-y-5">
      {highlightKeys.length > 0 ? (
        <section className="glass-panel rounded-xl p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Personal highlights</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Front-loaded for how you use the day</h3>
            </div>
            <p className="text-sm text-slate-500">Based on your saved preferences</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {highlightKeys.map((key) => {
              const meta = lifeIndexMeta.find((item) => item.key === key);

              if (!meta) {
                return null;
              }

              return (
                <IndexCard
                  key={meta.key}
                  indexKey={meta.key}
                  title={meta.title}
                  icon={meta.icon}
                  result={indices[meta.key]}
                  direction={meta.direction}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {lifeIndexMeta.map((item) => (
          <IndexCard
            key={item.key}
            indexKey={item.key}
            title={item.title}
            icon={item.icon}
            result={indices[item.key]}
            direction={item.direction}
          />
        ))}
      </section>

      <section className="glass-panel rounded-xl p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="section-kicker">What is included</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">A full public set of sixteen life indices.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              WeatherLife keeps stargazing, car wash, skin dryness, pipe freezing, heating and cooling, plus seasonal
              food and drink signals open to everyone.
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex min-w-fit items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Learn how the scale works
          </Link>
        </div>
      </section>
    </div>
  );
}

function getHighlightKeys(preferences?: UserPreferences | null): LifeIndexKey[] {
  if (!preferences) {
    return [];
  }

  const keys: LifeIndexKey[] = [];

  if (preferences.runner || preferences.cyclist) {
    keys.push("exercise");
  }

  if (preferences.pollen_alert) {
    keys.push("pollen");
  }

  if (preferences.units === "imperial") {
    keys.push("clothing");
  }

  keys.push("comfort");

  return Array.from(new Set(keys)).slice(0, 3);
}
