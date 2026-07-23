import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "WedBridge — Tamil Nadu Matrimony & Wedding Marketplace",
  description:
    "AI-powered matrimony platform connecting Tamil Nadu families with verified profiles, plus a full wedding vendor marketplace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
