import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://wedbridge.com";
  const routes = [
    { route: "", priority: 1, changeFrequency: "daily" as const },
    { route: "/login", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/register", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/search", priority: 0.9, changeFrequency: "daily" as const },
    { route: "/matches", priority: 0.9, changeFrequency: "daily" as const },
    { route: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/ai-matches", priority: 0.8, changeFrequency: "daily" as const },
    { route: "/membership", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/profile", priority: 0.6, changeFrequency: "weekly" as const },
    { route: "/favourites", priority: 0.6, changeFrequency: "weekly" as const },
    { route: "/interests", priority: 0.6, changeFrequency: "weekly" as const },
    { route: "/notifications", priority: 0.5, changeFrequency: "weekly" as const },
    { route: "/settings", priority: 0.4, changeFrequency: "monthly" as const },
  ];
  const now = new Date();
  return routes.map((r) => ({ url: `${base}${r.route}`, lastModified: now, changeFrequency: r.changeFrequency, priority: r.priority }));
}
