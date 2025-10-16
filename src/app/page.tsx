import AnnouncementBanner from '@/components/sections/announcement-banner';
import NavigationHeader from '@/components/sections/navigation-header';
import HeroSection from '@/components/sections/hero-section';
import FeaturesGrid from '@/components/sections/features-grid';
import HowItWorksSection from '@/components/sections/how-it-works';
import ExamplesShowcase from '@/components/sections/examples-showcase';
import TestimonialsSection from '@/components/sections/testimonials';
import ShowcaseGallery from '@/components/sections/showcase-gallery';
import NewsletterSignup from '@/components/sections/newsletter-signup';
import RoadmapPreview from '@/components/sections/roadmap-preview';
import FaqAccordion from '@/components/sections/faq-accordion';
import Footer from '@/components/sections/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner />
      <NavigationHeader />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <HowItWorksSection />
        <ExamplesShowcase />
        <TestimonialsSection />
        <ShowcaseGallery />
        <NewsletterSignup />
        <RoadmapPreview />
        <FaqAccordion />
      </main>
      <Footer />
    </div>
  );
}