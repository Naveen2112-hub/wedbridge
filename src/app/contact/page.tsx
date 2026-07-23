import type { Metadata } from "next";
import { ContactClient } from "@/components/info/ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — WedBridge",
  description: "Get in touch with WedBridge. Call, email, or message us on WhatsApp.",
};

export default function ContactPage() {
  return <ContactClient />;
}
