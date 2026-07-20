import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://wedbridge.app"),
  title: {
    default: "WedBridge - Tamil Nadu's Premier Matrimony & Wedding Marketplace",
    template: "%s | WedBridge",
  },
  description: "Find your perfect life partner and book trusted wedding vendors across Tamil Nadu. AI-powered matching, verified profiles, and 20+ wedding service categories.",
  keywords: ["matrimony", "wedding", "Tamil Nadu matrimony", "wedding vendors", "marriage bureau", "AI matching", "bride", "groom"],
  authors: [{ name: "WedBridge" }],
  creator: "WedBridge",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://wedbridge.app",
    siteName: "WedBridge",
    title: "WedBridge - Tamil Nadu's Premier Matrimony & Wedding Marketplace",
    description: "Find your perfect life partner and book trusted wedding vendors across Tamil Nadu.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "WedBridge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WedBridge - Matrimony & Wedding Marketplace",
    description: "Find your perfect life partner and book trusted wedding vendors across Tamil Nadu.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#f54e00",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WedBridge",
    url: "https://wedbridge.app",
    description: "Tamil Nadu's premier matrimony and wedding marketplace platform.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://wedbridge.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
