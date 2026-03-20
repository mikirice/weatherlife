import type { DashboardSnapshot } from "@/types";

const columns = [
  { key: "clothing", label: "👕" },
  { key: "umbrella", label: "☂️" },
  { key: "laundry", label: "🧺" },
  { key: "exercise", label: "🏃" },
  { key: "comfort", label: "💧" },
  { key: "stargazing", label: "🌟" }
] as const;

export function ProForecastTable({
  forecast
}: {
  forecast: DashboardSnapshot["forecast"];
}) {
  return (
    <section className="glass-panel overflow-hidden rounded-[32px] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Extended outlook</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">10-day index outlook</h2>
        </div>
        <p className="hidden text-sm text-slate-500 md:block">Compact trend read</p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="pb-2 pr-4 font-medium">Day</th>
              {columns.map((column) => (
                <th key={column.key} className="pb-2 pr-4 font-medium">
                  {column.label}
                </th>
              ))}
              <th className="pb-2 font-medium">Range</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((day) => (
              <tr key={day.date} className="rounded-[20px] bg-white/60">
                <td className="rounded-l-[20px] px-4 py-3 font-semibold text-slate-800">{day.label}</td>
                {columns.map((column) => (
                  <td key={column.key} className="px-2 py-3 text-slate-700">
                    {day.indices[column.key].score}
                  </td>
                ))}
                <td className="rounded-r-[20px] px-4 py-3 text-slate-500">
                  {Math.round(day.summary.minTemperature)}-{Math.round(day.summary.maxTemperature)}°
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function HourlyInsights({
  insights
}: {
  insights: DashboardSnapshot["hourlyInsights"];
}) {
  return (
    <section className="glass-panel overflow-hidden rounded-[32px] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Hourly changes</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">When the day shifts on you</h2>
        </div>
        <p className="hidden text-sm text-slate-500 md:block">Timing signals</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {insights.map((insight) => (
          <article
            key={insight.key}
            className="rounded-[24px] border border-white/70 bg-white/65 p-4 shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
          >
            <p className="text-2xl">{insight.icon}</p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{insight.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{insight.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
