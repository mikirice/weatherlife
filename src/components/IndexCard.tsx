import { lifeIndexIcons } from "@/components/icons/LifeIndexIcons";
import type { IndexDirection, LifeIndexKey, LifeIndexResult } from "@/types";

type IndexCardProps = {
  indexKey: LifeIndexKey;
  title: string;
  icon: string;
  result: LifeIndexResult;
  direction: IndexDirection;
};

const trackGradients: Record<IndexDirection, string> = {
  higher: "linear-gradient(90deg, #8ed9b5 0%, #4bc490 45%, #1f8f72 100%)",
  lower: "linear-gradient(90deg, #2ea488 0%, #e6ad53 45%, #d86241 100%)",
  neutral: "linear-gradient(90deg, #79c7ba 0%, #7ea5d8 52%, #d7a15a 100%)"
};

const chipStyles: Record<IndexDirection, string> = {
  higher: "text-emerald-800 bg-emerald-100/80",
  lower: "text-amber-900 bg-amber-100/80",
  neutral: "text-sky-900 bg-sky-100/80"
};

const iconColorsByKey: Record<string, string> = {
  clothing: "text-violet-500",
  umbrella: "text-blue-500",
  pollen: "text-yellow-500",
  laundry: "text-cyan-500",
  uv: "text-orange-500",
  coldRisk: "text-sky-400",
  exercise: "text-emerald-500",
  comfort: "text-teal-500",
  stargazing: "text-indigo-400",
  carWash: "text-blue-400",
  skinDryness: "text-rose-400",
  pipeFreezing: "text-slate-400",
  heatingCooling: "text-red-400",
  nabe: "text-orange-400",
  beer: "text-amber-500",
  iceCream: "text-pink-400"
};

export function IndexCard({ indexKey, title, icon, result, direction }: IndexCardProps) {
  const IconComponent = lifeIndexIcons[indexKey];

  return (
    <article className="glass-panel relative overflow-hidden rounded-xl p-3.5 transition-all hover:bg-gray-50/80 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {IconComponent ? (
            <span className={iconColorsByKey[indexKey] ?? "text-gray-500"}>
              <IconComponent size={20} />
            </span>
          ) : (
            <span className="text-lg leading-none">{icon}</span>
          )}
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        </div>
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${chipStyles[direction]}`}
        >
          {result.score}/10
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs leading-5 text-gray-600 line-clamp-1">{result.label}</p>
        {result.seasonal ? (
          <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-gray-500">
            {result.inSeason ? "Season" : "Off"}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5">
        <div className="h-2 overflow-hidden rounded-full bg-gray-100 ring-1 ring-black/5">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(0, Math.min(10, result.score)) * 10}%`,
              backgroundImage: trackGradients[direction]
            }}
          />
        </div>
      </div>
    </article>
  );
}
