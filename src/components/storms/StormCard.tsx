import type { NHCStorm } from "@/lib/api/nhc";
import { getStormCategory } from "@/lib/api/nhc";

export function StormCard({ storm }: { storm: NHCStorm }) {
  const cat = getStormCategory(storm.classification);

  return (
    <article className="glass-panel rounded-[20px] p-4 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌀</span>
          <div>
            <h3 className="text-base font-semibold tracking-tight">{storm.name}</h3>
            <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${cat.color} ${cat.bgColor}`}>
              {cat.label}
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {storm.intensity && (
          <div>
            <dt className="text-slate-400">Wind</dt>
            <dd className="font-semibold text-slate-700">{storm.intensity} mph</dd>
          </div>
        )}
        {storm.pressure && (
          <div>
            <dt className="text-slate-400">Pressure</dt>
            <dd className="font-semibold text-slate-700">{storm.pressure} mb</dd>
          </div>
        )}
        {storm.movementDir && (
          <div>
            <dt className="text-slate-400">Moving</dt>
            <dd className="font-semibold text-slate-700">{storm.movementDir} at {storm.movementSpeed} mph</dd>
          </div>
        )}
        <div>
          <dt className="text-slate-400">Position</dt>
          <dd className="font-semibold text-slate-700">{storm.latitude}, {storm.longitude}</dd>
        </div>
      </dl>

      {storm.publicAdvisory?.url && (
        <a
          href={storm.publicAdvisory.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs font-medium text-teal-700 hover:text-teal-900"
        >
          Public Advisory →
        </a>
      )}
    </article>
  );
}
