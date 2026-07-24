import { NextRequest, NextResponse } from "next/server";

/**
 * Edge Middleware — runs before every matched request.
 *
 * Responsibilities:
 *  1. Redirect unauthenticated users away from protected pages
 *  2. Redirect unauthenticated visits to admin pages → /admin/login
 *  3. Add rate-limit hint headers to API responses
 *
 * IMPORTANT: Firebase JWT verification needs the Node.js runtime.
 * Here we only do a lightweight session-cookie presence check.
 * Full token verification happens inside each API route via getAuthUser().
 */

// All /admin/* paths that require an admin session
const ADMIN_PROTECTED = [
  "/admin/dashboard",
  "/admin/users",
  "/admin/profiles",
  "/admin/vendors",
  "/admin/bookings",
  "/admin/payments",
  "/admin/membership",
  "/admin/memberships",
  "/admin/analytics",
  "/admin/reports",
  "/admin/settings",
  "/admin/notifications",
  "/admin/bulk-upload",
  "/admin/export",
  "/admin/ocr-upload",
  "/admin/telegram",
  "/admin/monitoring",
  "/admin/backup",
  "/admin/activity-logs",
  "/admin/maintenance",
  "/admin/profile",
];

// User-level pages that require any authenticated session
const USER_PROTECTED = [
  "/dashboard",
  "/profile/edit",
  "/profile",
  "/complete-profile",
  "/search",
  "/ai-matches",
  "/favourites",
  "/interests",
  "/notifications",
  "/membership",
  "/settings",
  "/messages",
  "/my-bookings",
  "/wedding-planner",
  "/vendor/create",
  "/vendor-dashboard",
  "/matches",
];

/** Returns true when the request carries a Firebase session cookie. */
function hasSession(req: NextRequest): boolean {
  const session =
    req.cookies.get("__session")?.value ??
    req.cookies.get("session")?.value ??
    "";
  return session.trim().length > 0;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin guard ────────────────────────────────────────────
  if (ADMIN_PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!hasSession(req)) {
      const dest = req.nextUrl.clone();
      dest.pathname = "/admin/login";
      dest.searchParams.set("redirect", pathname);
      return NextResponse.redirect(dest);
    }
  }

  // ── User guard ─────────────────────────────────────────────
  if (USER_PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!hasSession(req)) {
      const dest = req.nextUrl.clone();
      dest.pathname = "/login";
      dest.searchParams.set("redirect", pathname);
      return NextResponse.redirect(dest);
    }
  }

  const res = NextResponse.next();

  // ── Security headers for API routes ───────────────────────
  if (pathname.startsWith("/api/")) {
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Cache-Control", "no-store");
    // Surface rate-limit bucket hint (actual enforcement is in securityService.ts)
    res.headers.set("X-RateLimit-Policy", "60;w=60");
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match everything EXCEPT:
     * - /_next/static  (immutable chunks)
     * - /_next/image   (optimised images)
     * - /icon*, /favicon*, /manifest*, /robots*, /sitemap*
     * - Any file with an extension (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icon|manifest|robots|sitemap|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|css|js)).*)",
  ],
};
