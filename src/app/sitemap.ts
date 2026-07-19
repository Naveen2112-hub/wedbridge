import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const lastModified = new Date();
  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/search`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/ai-matches`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/wedding-services`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/success-stories`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/membership`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];
}
