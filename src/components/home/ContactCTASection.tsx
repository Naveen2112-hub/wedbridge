"use client";

import Link from "next/link";
import { Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function ContactCTASection() {
  return (
    <Section className="bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <Reveal>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 to-rose-800 px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Find Your Perfect Match?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-rose-100">Join thousands of Tamil Nadu families who found their life partner through WedBridge. Our AI-powered matchmaking and verified profiles make your search simple and secure.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow-lg transition hover:bg-rose-50">Register Free <ArrowRight className="h-4 w-4" /></Link>
            <a href="tel:+916383109341" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"><Phone className="h-4 w-4" /> +91 63831 09341</a>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm text-rose-100 sm:flex-row sm:gap-8">
            <a href="mailto:support@wedbridge.in" className="flex items-center gap-1.5 hover:text-white"><Mail className="h-4 w-4" /> support@wedbridge.in</a>
            <a href="https://wa.me/916383109341" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white"><MessageCircle className="h-4 w-4" /> WhatsApp Support</a>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
