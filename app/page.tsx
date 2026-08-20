import { AboutSection } from "@/components/home/AboutSection";
import { ArtistsCarousel } from "@/components/home/ArtistsCarousel";
import { CTASection } from "@/components/home/CTASection";
import { GlobeZoom } from "@/components/home/GlobeZoom";
import { HeroSection } from "@/components/home/HeroSection";
import { SpecialtiesSection } from "@/components/home/SpecialtiesSection";
import { TestimonialsMarquee } from "@/components/home/TestimonialsMarquee";
import { STUDIO } from "@/lib/data/studio";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: STUDIO.name,
    description: STUDIO.description,
    telephone: STUDIO.phone,
    email: STUDIO.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: STUDIO.address.city,
      addressCountry: "IE",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroSection />
      <AboutSection />
      <SpecialtiesSection />
      <ArtistsCarousel />
      <TestimonialsMarquee />
      <GlobeZoom />
      <CTASection />
    </>
  );
}
