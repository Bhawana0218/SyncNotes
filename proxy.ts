import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE_PREFIXES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function hasSessionToken(request: NextRequest) {
  return request.cookies.getAll().some((cookie) =>
    SESSION_COOKIE_PREFIXES.some(
      (prefix) =>
        cookie.name === prefix ||
        cookie.name.startsWith(`${prefix}.`)
    )
  );
}

export default function proxy(request: NextRequest) {
  if (hasSessionToken(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    "/archive/:path*",
    "/settings/:path*",
  ],
};
