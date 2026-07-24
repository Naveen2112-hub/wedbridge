import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { WhySection } from "@/components/home/WhySection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedProfilesSection } from "@/components/home/FeaturedProfilesSection";
import { AISection } from "@/components/home/AISection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { SuccessStoriesSection } from "@/components/home/SuccessStoriesSection";
import { MembershipSection } from "@/components/home/MembershipSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { DownloadSection } from "@/components/home/DownloadSection";
import { ContactCTASection } from "@/components/home/ContactCTASection";

export const metadata: Metadata = {
  title: "WedBridge — Tamil Nadu Matrimony & Wedding Marketplace",
  description:
    "AI-powered matrimony platform connecting Tamil Nadu families with verified profiles, plus a full wedding vendor marketplace.",
  alternates: { canonical: "https://wedbridge.com" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "WedBridge",
  url: "https://wedbridge.com",
  description:
    "AI-powered matrimony platform connecting Tamil Nadu families with verified profiles, plus a full wedding vendor marketplace.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://wedbridge.com/search?q={query}",
    "query-input": "required name=query",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <WhySection />
      <StatsSection />
      <FeaturedProfilesSection />
      <AISection />
      <ServicesSection />
      <SuccessStoriesSection />
      <MembershipSection />
      <TestimonialsSection />
      <FaqSection />
      <DownloadSection />
      <ContactCTASection />
    </>
  );
}
