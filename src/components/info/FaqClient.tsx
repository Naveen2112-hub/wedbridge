"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const faqs = [
  { q: "How do I register on WedBridge?", a: "Click 'Register Free' on the homepage, fill in your email and password, then complete your profile with personal details, photo, and preferences." },
  { q: "Is WedBridge free to use?", a: "Basic registration and browsing are free. Premium and Gold memberships unlock advanced features like unlimited interests, AI matching, contact details, and profile highlighting." },
  { q: "How does AI matchmaking work?", a: "Our AI engine analyzes your profile, preferences, values, lifestyle, education, and horoscope to generate compatibility scores and recommend the best matches." },
  { q: "Are profiles verified?", a: "Yes. All profiles go through a verification process. Verified profiles display a badge. Premium members get background verification." },
  { q: "What is the wedding marketplace?", a: "WedBridge offers a marketplace of verified wedding vendors including photographers, caterers, decorators, makeup artists, marriage halls, and more across Tamil Nadu." },
  { q: "How do I book a vendor?", a: "Browse the marketplace, select a vendor, view their packages and gallery, then use the booking form to request a date. The vendor will confirm your booking." },
  { q: "What payment methods are supported?", a: "We support Razorpay for secure payments including UPI, credit/debit cards, net banking, and popular wallets." },
  { q: "Can I get a refund on my membership?", a: "Membership fees are non-refundable once activated. Please review our Refund Policy for detailed terms." },
  { q: "How do I contact support?", a: "You can reach us at +91 63831 09341, support@wedbridge.in, or via WhatsApp. Our team is available 7 days a week." },
  { q: "Is my data secure?", a: "Yes. We use industry-standard encryption and security measures. Your contact details are only visible to users you have accepted interests from." },
];

export function FaqClient() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Reveal>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-neutral-600">Find answers to common questions about WedBridge.</p>
        </div>
      </Reveal>
      <div className="mt-10 space-y-3">
        {faqs.map((faq, i) => (
          <Reveal key={i} delay={i * 50}>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                <span className="font-semibold text-neutral-900">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 flex-none text-neutral-500 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-5 pb-4 text-sm text-neutral-600">{faq.a}</div>}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
