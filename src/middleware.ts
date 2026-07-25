import { NextResponse, type NextRequest } from "next/server";

// Authentication is handled client-side via Firebase onAuthStateChanged + AuthGuard/AdminGuard.
// The previous session-cookie check redirected authenticated users away from protected pages
// because client-side Firebase Auth does not set an __session cookie.

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();

  if (_req.nextUrl.pathname.startsWith("/api/")) {
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-RateLimit-Policy", "60;w=60");
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon|manifest|robots|sitemap|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|css|js)).*)",
  ],
};
