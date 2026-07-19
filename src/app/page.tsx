import { PublicLayout } from "@/components/layout/PublicLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { WhySection } from "@/components/home/WhySection";
import { FeaturedProfilesSection } from "@/components/home/FeaturedProfilesSection";
import { AISection } from "@/components/home/AISection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { MembershipSection } from "@/components/home/MembershipSection";
import { SuccessStoriesSection } from "@/components/home/SuccessStoriesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { DownloadSection } from "@/components/home/DownloadSection";
export default function HomePage() {
  return (<PublicLayout><HeroSection /><StatsSection /><WhySection /><FeaturedProfilesSection /><AISection /><ServicesSection /><MembershipSection /><SuccessStoriesSection /><TestimonialsSection /><FaqSection /><DownloadSection /></PublicLayout>);
}
