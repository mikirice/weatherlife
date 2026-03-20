import { getWeatherEmoji } from "@/lib/api/open-meteo";
import type { HourlyForecastItem } from "@/types/weather";

export function HourlyForecast({ items }: { items: HourlyForecastItem[] }) {
  return (
    <section className="glass-panel rounded-[32px] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Hourly breakdown</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Key moments for the rest of today</h2>
        </div>
        <p className="hidden text-sm text-slate-500 md:block">Six glanceable checkpoints</p>
      </div>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <article
            key={item.time}
            className="min-w-[112px] rounded-[24px] border border-white/70 bg-white/65 p-4 shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.displayTime}</p>
            <p className="mt-3 text-3xl">{getWeatherEmoji(item.weatherCode, item.isDay)}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{item.temperature}°</p>
            <div className="mt-4 space-y-1 text-sm text-slate-500">
              <p>Rain {item.precipitationProbability}%</p>
              <p>UV {item.uvIndex}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
