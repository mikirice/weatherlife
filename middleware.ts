import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getSessionFromTokens,
  isSupabaseConfigured
} from "@/lib/supabase";

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getSessionFromTokens(accessToken, refreshToken);

  if (!session) {
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }

  if (session.access_token && session.access_token !== accessToken) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60
    });
  }

  if (session.refresh_token && session.refresh_token !== refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
