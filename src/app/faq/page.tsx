import type { Metadata } from "next";
import { FaqClient } from "@/components/info/FaqClient";

export const metadata: Metadata = { title: "FAQ — WedBridge", description: "Frequently asked questions." };

export default function FaqPage() { return <FaqClient />; }
