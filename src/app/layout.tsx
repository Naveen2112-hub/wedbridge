import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "WedBridge — Premium Matrimony & Wedding Services",
    template: "%s · WedBridge",
  },
  description:
    "WedBridge is a premium South Indian matrimony and wedding services platform with AI matchmaking, verified profiles, and a curated wedding vendor marketplace.",
  applicationName: "WedBridge",
  keywords: ["matrimony", "South Indian wedding", "Tamil matrimony", "AI matchmaking", "wedding services"],
  authors: [{ name: "WedBridge" }],
  openGraph: {
    title: "WedBridge — Premium Matrimony & Wedding Services",
    description: "AI-powered matchmaking and curated wedding services for South Indian families.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#7A1022",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
