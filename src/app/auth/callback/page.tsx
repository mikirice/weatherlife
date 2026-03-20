"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Finishing sign-in...");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const code = searchParams.get("code");

    if (!supabase || !code) {
      router.replace("/login?error=callback");
      return;
    }

    void (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace("/settings");
    })();
  }, [router, searchParams]);

  return (
    <main className="shell pb-12 pt-6">
      <section className="glass-panel mx-auto max-w-xl rounded-[34px] p-10 text-center">
        <p className="section-kicker">Auth callback</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Almost there</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{message}</p>
      </section>
    </main>
  );
}
