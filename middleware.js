import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/overview",
  "/equipment",
  "/availability",
  "/performance",
  "/quality",
  "/analytics",
  "/alerts",
  "/data-entry",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const hasSession = Boolean(request.cookies.get("oee_user")?.value);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (pathname === "/login") {
    if (hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/overview";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/equipment/:path*",
    "/availability/:path*",
    "/performance/:path*",
    "/quality/:path*",
    "/analytics/:path*",
    "/alerts/:path*",
    "/data-entry/:path*",
    "/login",
  ],
};
