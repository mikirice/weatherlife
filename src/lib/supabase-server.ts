import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, getSessionFromTokens } from "@/lib/supabase";

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  return getSessionFromTokens(accessToken, refreshToken);
}

export async function getUserFromCookies() {
  const session = await getSessionFromCookies();
  return session?.user ?? null;
}
