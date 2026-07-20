import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

const siteUrl = "https://wedbridge.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WedBridge - Free Service & Premium Matrimony & Wedding Services Platform",
    template: "%s | WedBridge",
  },
  description: "WedBridge is a free service and premium matrimony platform connecting Tamil Nadu families. AI-powered matchmaking, verified profiles, and complete wedding services.",
  keywords: ["matrimony", "Tamil Nadu matrimony", "Tamil matrimony", "wedding services", "matchmaking", "AI matching", "WedBridge"],
  authors: [{ name: "WedBridge" }],
  creator: "WedBridge",
  publisher: "WedBridge",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "WedBridge",
    title: "WedBridge - Free Service & Premium Matrimony & Wedding Services Platform",
    description: "AI-powered matrimony platform connecting Tamil Nadu families. Find your perfect match with verified profiles and wedding services.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "WedBridge Matrimony" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WedBridge - Premium Matrimony & Wedding Services",
    description: "AI-powered matrimony platform connecting Tamil Nadu families.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  category: "matrimony",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#7A1022",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WedBridge",
    url: siteUrl,
    description: "Free Service & Premium Matrimony & Wedding Services Platform",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#fdf2f4", color: "#1a1a1a", margin: 0 }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary-800 focus:px-4 focus:py-2 focus:text-white">Skip to main content</a>
        <Providers>
          <div id="main-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
