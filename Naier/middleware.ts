import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("nostr_logged_in")?.value === "true";

  if (!isLoggedIn) {
    const loginUrl = new URL("/", request.url);
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/settings/:path*", "/invite/:path*"]
};
