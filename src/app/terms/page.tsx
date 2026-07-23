import type { Metadata } from "next";
import { TermsClient } from "@/components/info/TermsClient";

export const metadata: Metadata = { title: "Terms of Service — WedBridge", description: "Terms of service." };

export default function TermsPage() { return <TermsClient />; }
