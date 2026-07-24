import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware runs on the Edge Runtime before every matched request.
 * Responsibilities:
 *  - Redirect unauthenticated visits to protected pages to /login
 *  - Redirect unauthenticated visits to /admin/* to /admin/login
 *  - Add security headers (supplementing next.config.mjs)
 *
 * NOTE: Firebase JWT verification requires the Node.js runtime and cannot run
 * here (Edge Runtime). We apply lightweight presence checks only; deep token
 * verification happens in each API route via getAuthUser().
 */

const ADMIN_PATHS = ["/admin/dashboard", "/admin/users", "/admin/vendors", "/admin/profiles", "/admin/payments", "/admin/bookings", "/admin/analytics", "/admin/reports", "/admin/settings", "/admin/notifications", "/admin/bulk-upload", "/admin/export", "/admin/ocr-upload", "/admin/monitoring", "/admin/backup", "/admin/membership", "/admin/memberships", "/admin/telegram", "/admin/activity-logs"];

const PROTECTED_PATHS = ["/dashboard", "/profile", "/search", "/ai-matches", "/favourites", "/interests", "/notifications", "/membership", "/settings", "/messages", "/my-bookings", "/wedding-planner", "/profile/edit", "/vendor/create", "/vendor-dashboard", "/complete-profile"];

function hasSessionCookie(req: NextRequest): boolean {
  const cookie = req.cookies.get("__session")?.value ?? req.cookies.get("session")?.value ?? "";
  return cookie.length > 0;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin route guard — redirect to /admin/login
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!hasSessionCookie(req)) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // User route guard — redirect to /login
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!hasSessionCookie(req)) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const res = NextResponse.next();

  // Extra headers for API routes
  if (pathname.startsWith("/api/")) {
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|manifest|robots|sitemap|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};
