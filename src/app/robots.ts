import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/profile/edit", "/complete-profile", "/settings", "/notifications", "/interests", "/favourites", "/my-bookings", "/vendor-dashboard", "/ai-matches", "/messages", "/matches", "/dashboard", "/profile/"] },
    sitemap: "https://wedbridge.com/sitemap.xml",
    host: "https://wedbridge.com",
  };
}
