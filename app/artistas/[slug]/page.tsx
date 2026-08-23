import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaLink } from "@/components/ui/CursorLink";
import { BookWithArtist } from "@/components/ui/BookWithArtist";
import { getArtist, getArtists, getGallery, getSpecialties } from "@/lib/content";
import { ArtistGallery } from "@/components/artists/ArtistGallery";
import { MediaImage } from "@/components/ui/MediaImage";
import { instagramUrl } from "@/lib/utils";

export async function generateStaticParams() {
  const list = await getArtists();
  return list.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);
  return { title: artist?.name ?? "Artist" };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();
  const [gallery, specialties] = await Promise.all([getGallery(), getSpecialties()]);
  const works = gallery.filter((w) => w.artistSlug === artist.slug);

  return (
    <div className="page-shell">
      <div className="grid items-end gap-8 md:grid-cols-2 md:gap-10">
        <div className="relative aspect-[3/4] overflow-hidden">
          <MediaImage src={artist.image} alt={artist.name} fill className="object-cover" priority sizes="50vw" />
        </div>
        <div>
          <p className="label-mono">{artist.role}</p>
          <h1 className="display-section mt-3">{artist.name}</h1>
          <p className="mt-4 text-moss">{artist.specialty}</p>
          <p className="mt-6 max-w-lg text-ink-secondary">{artist.bioLong}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {artist.specialties.map((s) => (
              <span key={s} className="label-mono border border-line px-3 py-1">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <BookWithArtist slug={artist.slug} firstName={artist.name.split(" ")[0] ?? artist.name} />
            {artist.instagram ? (
              <CtaLink href={instagramUrl(artist.instagram)} variant="outline">
                Instagram
              </CtaLink>
            ) : null}
          </div>
        </div>
      </div>
      <ArtistGallery
        specialties={specialties}
        works={works.length ? works : artist.works.map((image, i) => ({
        id: `${artist.slug}-${i}`,
        title: `Work ${i + 1}`,
        artistSlug: artist.slug,
        artistName: artist.name,
        style: artist.specialties[0],
        image,
        hours: 6,
        bodyPart: "—",
      }))} />
    </div>
  );
}
