import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
