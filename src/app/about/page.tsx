import type { Metadata } from "next";
import { AboutClient } from "@/components/info/AboutClient";

export const metadata: Metadata = {
  title: "About Us — WedBridge",
  description: "Learn about WedBridge, Tamil Nadu's premier AI-powered matrimony and wedding marketplace platform.",
};

export default function AboutPage() {
  return <AboutClient />;
}
