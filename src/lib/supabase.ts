import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";

export const ACCESS_TOKEN_COOKIE = "dp-access-token";
export const REFRESH_TOKEN_COOKIE = "dp-refresh-token";

let cachedAdminClient: SupabaseClient | null | undefined;
let cachedAnonClient: SupabaseClient | null | undefined;
let cachedBrowserClient: SupabaseClient | null | undefined;

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    return null;
  }

  if (cachedBrowserClient !== undefined) {
    return cachedBrowserClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    cachedBrowserClient = null;
    return cachedBrowserClient;
  }

  cachedBrowserClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  return cachedBrowserClient;
}

export function getSupabaseServerClient() {
  if (cachedAnonClient !== undefined) {
    return cachedAnonClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    cachedAnonClient = null;
    return cachedAnonClient;
  }

  cachedAnonClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return cachedAnonClient;
}

export function getSupabaseAdminClient() {
  if (cachedAdminClient !== undefined) {
    return cachedAdminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cachedAdminClient = null;
    return cachedAdminClient;
  }

  cachedAdminClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return cachedAdminClient;
}

export async function getSessionFromTokens(
  accessToken?: string,
  refreshToken?: string
): Promise<Session | null> {
  const client = getSupabaseServerClient();

  if (!client || (!accessToken && !refreshToken)) {
    return null;
  }

  if (accessToken) {
    const { data, error } = await client.auth.getUser(accessToken);
    if (!error && data.user) {
      return {
        access_token: accessToken,
        refresh_token: refreshToken ?? "",
        expires_in: 0,
        expires_at: 0,
        token_type: "bearer",
        user: data.user
      };
    }
  }

  if (!refreshToken) {
    return null;
  }

  const { data, error } = await client.auth.refreshSession({
    refresh_token: refreshToken
  });

  if (error || !data.session) {
    return null;
  }

  return data.session;
}

export function serializeViewerUser(user: User | null) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    name:
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      null,
    avatarUrl:
      (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url) || null
  };
}
