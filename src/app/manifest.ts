import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WedBridge - Tamil Nadu Matrimony",
    short_name: "WedBridge",
    description: "Find your perfect match in Tamil Nadu with WedBridge. AI-powered matchmaking and wedding services.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf7",
    theme_color: "#a51d3c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
