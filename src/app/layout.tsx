import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

const siteUrl = "https://wedbridge.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WedBridge — Tamil Nadu Matrimony & Wedding Marketplace",
    template: "%s — WedBridge",
  },
  description:
    "AI-powered matrimony platform connecting Tamil Nadu families with verified profiles, plus a full wedding vendor marketplace.",
  keywords: ["matrimony", "Tamil Nadu", "wedding", "matchmaking", "AI matchmaking", "wedding vendors", "biodata", "matrimonial"],
  authors: [{ name: "WedBridge" }],
  creator: "WedBridge",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "WedBridge",
    title: "WedBridge — Tamil Nadu Matrimony & Wedding Marketplace",
    description: "AI-powered matrimony platform connecting Tamil Nadu families with verified profiles, plus a full wedding vendor marketplace.",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "WedBridge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WedBridge — Tamil Nadu Matrimony & Wedding Marketplace",
    description: "AI-powered matrimony platform connecting Tamil Nadu families with verified profiles, plus a full wedding vendor marketplace.",
    images: ["/icon-512.png"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#a51d3c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
