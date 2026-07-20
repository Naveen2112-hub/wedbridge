import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://wedbridge.com";
  const routes = ["", "/login", "/register", "/search", "/matches", "/services", "/membership", "/profile"];
  const now = new Date();
  return routes.map((route) => ({ url: `${base}${route}`, lastModified: now, changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.8 }));
}
