import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/profile/edit", "/my-bookings", "/vendor-dashboard"] },
    sitemap: "https://wedbridge.com/sitemap.xml",
    host: "https://wedbridge.com",
  };
}
