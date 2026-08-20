import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.getAll().some(({ name }) => name.includes("beauty_business.session_token"));
  if (hasSessionCookie) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!api|login|_next/static|_next/image|favicon.ico).*)"],
};
