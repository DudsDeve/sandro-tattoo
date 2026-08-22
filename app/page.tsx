"use client";

import { useEffect, useState } from "react";
import { AboutSection } from "@/components/home/AboutSection";
import { ArtistsCarousel } from "@/components/home/ArtistsCarousel";
import { CTASection } from "@/components/home/CTASection";
import { HeroSection } from "@/components/home/HeroSection";
import { SpecialtiesSection } from "@/components/home/SpecialtiesSection";
import { STUDIO } from "@/lib/data/studio";
import type { Artist, Specialty } from "@/lib/types";

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

export default function HomePage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    void fetch("/api/home")
      .then((r) => r.json())
      .then((d: { specialties?: Specialty[]; artists?: Artist[] }) => {
        setSpecialties(Array.isArray(d.specialties) ? d.specialties : []);
        setArtists(Array.isArray(d.artists) ? d.artists : []);
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroSection />
      <AboutSection />
      <SpecialtiesSection specialties={specialties} />
      <ArtistsCarousel artists={artists} />
      <CTASection />
    </>
  );
}
