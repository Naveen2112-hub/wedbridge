import type { MetadataRoute } from "next";
export default function Sitemap(): MetadataRoute.Sitemap { const base = "https://wedbridge.app"; const routes = ["", "/login", "/register", "/forgot-password"]; return routes.map((r) => ({ url: `${base}${r}`, lastModified: new Date() })); }
