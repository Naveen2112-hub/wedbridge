import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://wedbridge.com";
  const routes = [
    { route: "", priority: 1, changeFrequency: "daily" as const },
    { route: "/login", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/register", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/search", priority: 0.9, changeFrequency: "daily" as const },
    { route: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/membership", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { route: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { route: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
    { route: "/careers", priority: 0.5, changeFrequency: "monthly" as const },
    { route: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
    { route: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
    { route: "/refund", priority: 0.4, changeFrequency: "yearly" as const },
    { route: "/vendor/search", priority: 0.7, changeFrequency: "weekly" as const },
    { route: "/vendor-login", priority: 0.6, changeFrequency: "monthly" as const },
    { route: "/wedding-planner", priority: 0.7, changeFrequency: "weekly" as const },
  ];
  const now = new Date();
  return routes.map((r) => ({ url: `${base}${r.route}`, lastModified: now, changeFrequency: r.changeFrequency, priority: r.priority }));
}
