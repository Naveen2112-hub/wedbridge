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
  keywords: [
    "matrimony", "Tamil Nadu", "wedding", "matchmaking", "AI matchmaking",
    "wedding vendors", "biodata", "matrimonial", "Tamil matrimony",
    "south india wedding", "marriage", " திருமணம்",
  ],
  authors: [{ name: "WedBridge", url: siteUrl }],
  creator: "WedBridge",
  publisher: "WedBridge",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["ta_IN"],
    url: siteUrl,
    siteName: "WedBridge",
    title: "WedBridge — Tamil Nadu Matrimony & Wedding Marketplace",
    description:
      "AI-powered matrimony platform connecting Tamil Nadu families with verified profiles, plus a full wedding vendor marketplace.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WedBridge — Tamil Nadu Matrimony & Wedding Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@wedbridge",
    title: "WedBridge — Tamil Nadu Matrimony & Wedding Marketplace",
    description:
      "AI-powered matrimony platform connecting Tamil Nadu families with verified profiles, plus a full wedding vendor marketplace.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#a51d3c" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0810" },
  ],
  width: "device-width",
  initialScale: 1,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "WedBridge",
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
  sameAs: [
    "https://www.facebook.com/wedbridge",
    "https://www.instagram.com/wedbridge",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["English", "Tamil"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
