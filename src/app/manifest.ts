import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WedBridge - Matrimony & Wedding Marketplace",
    short_name: "WedBridge",
    description: "Tamil Nadu's premier matrimony and wedding marketplace platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f3",
    theme_color: "#f54e00",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["lifestyle", "shopping", "social"],
  };
}
