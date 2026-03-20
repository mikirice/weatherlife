import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `No Login Required | ${siteConfig.name}`,
  description: `${siteConfig.name} is fully public. Open any city page without signing in.`
};

export default function LoginPage() {
  return (
    <main className="shell pb-12 pt-6">
      <section className="glass-panel mx-auto max-w-3xl rounded-[36px] p-8 text-center md:p-10">
        <p className="section-kicker">Public access</p>
        <h1 className="display-title mt-4 text-5xl font-semibold text-slate-800 md:text-6xl">
          No login is required anymore.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
          WeatherLife is now a fully public weather life index site. Browse cities, open dashboards, and use the
          daily guidance without an account.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/cities"
            className="rounded-full bg-[linear-gradient(135deg,#195f7d,#2ea488)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(25,95,125,0.2)]"
          >
            Browse cities
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-white/70 bg-white/75 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Learn about WeatherLife
          </Link>
        </div>
      </section>
    </main>
  );
}
