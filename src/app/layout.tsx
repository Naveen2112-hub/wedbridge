import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WedBridge - Wedding Marketplace",
  description: "Find and book trusted wedding vendors for your special day.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
