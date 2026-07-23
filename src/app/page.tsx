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

export default function HomePage() {
  return (
    <>
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
    </>
  );
}
