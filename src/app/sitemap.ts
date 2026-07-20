import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://wedbridge.app";
  const routes = [
    { url: `${base}/`, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${base}/login`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/register`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/search`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${base}/matches`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${base}/membership`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/services`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${base}/my-bookings`, priority: 0.6, changeFrequency: "weekly" as const },
    { url: `${base}/vendor-dashboard`, priority: 0.6, changeFrequency: "weekly" as const },
  ];
  return routes;
}
