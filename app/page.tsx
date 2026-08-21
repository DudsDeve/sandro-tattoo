import { AboutSection } from "@/components/home/AboutSection";
import { ArtistsCarousel } from "@/components/home/ArtistsCarousel";
import { CTASection } from "@/components/home/CTASection";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeTestimonials } from "@/components/home/HomeTestimonials";
import { SpecialtiesSection } from "@/components/home/SpecialtiesSection";
import { getArtists, getSpecialties } from "@/lib/content";
import { STUDIO } from "@/lib/data/studio";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [specialties, artists] = await Promise.all([getSpecialties(), getArtists()]);

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
      <SpecialtiesSection specialties={specialties} />
      <ArtistsCarousel artists={artists} />
      <HomeTestimonials />
      <CTASection />
    </>
  );
}
