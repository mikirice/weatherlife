"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/settings";
  const { user, isConfigured, isLoading, signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const result =
      mode === "signin"
        ? await signInWithPassword(email, password)
        : await signUpWithPassword(email, password);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage(
      mode === "signin"
        ? "Signed in. Redirecting..."
        : "Check your email to confirm the account if required."
    );
  }

  async function handleGoogle() {
    setMessage(null);
    const result = await signInWithGoogle();
    if (result.error) {
      setMessage(result.error);
    }
  }

  return (
    <main className="shell pb-12 pt-6">
      <section className="mx-auto max-w-4xl rounded-[40px] px-6 py-8 md:px-10 md:py-12">
        <div className="absolute inset-0" />
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel rounded-[34px] p-8">
            <p className="section-kicker">WeatherLife account</p>
            <h1 className="display-title mt-4 text-5xl font-semibold text-slate-800 md:text-6xl">
              Sync preferences when you want them.
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Sign in to store city preferences and keep your WeatherLife setup available across visits.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-slate-600">
              {[
                "Sixteen public life indices",
                "10-day forecast table and hourly insights",
                "Save up to 5 cities",
                "Runner, cyclist, pollen, and unit preferences"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-white/70 bg-white/70 px-4 py-3"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[34px] p-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "signin" ? "bg-slate-800 text-white" : "bg-white/70 text-slate-600"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "signup" ? "bg-slate-800 text-white" : "bg-white/70 text-slate-600"}`}
              >
                Create account
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleGoogle()}
              disabled={!isConfigured || isLoading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-[24px] border border-white/70 bg-white/75 px-4 py-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              <span className="text-base">G</span>
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-[22px] border border-white/70 bg-white/75 px-4 py-3 text-sm text-slate-700 outline-none"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-[22px] border border-white/70 bg-white/75 px-4 py-3 text-sm text-slate-700 outline-none"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={!isConfigured || isLoading}
                className="w-full rounded-[24px] bg-[linear-gradient(135deg,#195f7d,#2ea488)] px-4 py-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(25,95,125,0.2)] disabled:opacity-60"
              >
                {mode === "signin" ? "Sign in with email" : "Create account"}
              </button>
            </form>

            {!isConfigured ? (
              <p className="mt-4 text-sm text-amber-700">
                Supabase auth env vars are missing. Add them to enable login.
              </p>
            ) : null}
            {message ? <p className="mt-4 text-sm text-slate-500">{message}</p> : null}

            <p className="mt-6 text-sm text-slate-500">
              Public dashboards stay open without login.{" "}
              <Link href="/" className="font-semibold text-slate-700">
                Back to WeatherLife
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
