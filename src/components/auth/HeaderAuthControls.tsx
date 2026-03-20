"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";

export function HeaderAuthControls() {
  const { user, signOut, isLoading } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/settings"
        className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
      >
        Settings
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={isLoading}
        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white disabled:opacity-60"
      >
        Sign out
      </button>
    </div>
  );
}
