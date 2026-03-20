"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import type { Session } from "@supabase/supabase-js";

import type { ViewerState } from "@/types";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getSupabaseBrowserClient,
  isSupabaseConfigured
} from "@/lib/supabase";

type AuthContextValue = ViewerState & {
  isLoading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshViewer: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialViewer
}: {
  children: ReactNode;
  initialViewer: ViewerState;
}) {
  const [viewer, setViewer] = useState<ViewerState>(initialViewer);
  const [isLoading, setIsLoading] = useState(false);
  const isConfigured = isSupabaseConfigured();
  const initialFetchDoneRef = useRef(false);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let active = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      syncSessionCookies(data.session);

      if (!initialFetchDoneRef.current) {
        await refreshViewerState(setViewer);
        initialFetchDoneRef.current = true;
      }
    };

    void bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      syncSessionCookies(session);
      if (active) {
        await refreshViewerState(setViewer);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...viewer,
      isLoading,
      isConfigured,
      async signInWithGoogle() {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          return { error: "Supabase auth is not configured." };
        }

        const redirectTo = `${window.location.origin}/auth/callback`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo }
        });

        return error ? { error: error.message } : {};
      },
      async signInWithPassword(email: string, password: string) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          return { error: "Supabase auth is not configured." };
        }

        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setIsLoading(false);

        return error ? { error: error.message } : {};
      },
      async signUpWithPassword(email: string, password: string) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          return { error: "Supabase auth is not configured." };
        }

        setIsLoading(true);
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo }
        });
        setIsLoading(false);

        return error ? { error: error.message } : {};
      },
      async signOut() {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          return;
        }

        setIsLoading(true);
        await supabase.auth.signOut();
        clearSessionCookies();
        await refreshViewerState(setViewer);
        setIsLoading(false);
      },
      async refreshViewer() {
        setIsLoading(true);
        await refreshViewerState(setViewer);
        setIsLoading(false);
      }
    }),
    [isConfigured, isLoading, viewer]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

async function refreshViewerState(setViewer: (viewer: ViewerState) => void) {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    setViewer({
      user: null,
      profile: null,
      subscription: null,
      isPro: false
    });
    return;
  }

  const nextViewer = (await response.json()) as ViewerState;
  setViewer(nextViewer);
}

function syncSessionCookies(session: Session | null) {
  if (!session) {
    clearSessionCookies();
    return;
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE}=${session.access_token}; Path=/; SameSite=Lax; Max-Age=3600`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${session.refresh_token}; Path=/; SameSite=Lax; Max-Age=2592000`;
}

function clearSessionCookies() {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
}
