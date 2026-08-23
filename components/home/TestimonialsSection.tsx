"use client";

import Link from "next/link";
import { EditableText } from "@/components/site-editor/Editable";
import { MediaImage } from "@/components/ui/MediaImage";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { Testimonial } from "@/lib/types";
import { youtubeEmbedUrl } from "@/lib/utils";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const t = useT();
  return (
    <section className="bg-bg-primary py-24">
      <EditableText id="home.testimonials.label" as="p" className="label-mono mb-3 px-4 md:px-12">
        {t.testimonials.label}
      </EditableText>
      <EditableText id="home.testimonials.title" as="h2" className="display-section mb-12 px-4 md:px-12">
        {t.testimonials.title}
      </EditableText>
      {!testimonials.length ? (
        <p className="px-4 text-sm text-ink-muted md:px-12">Nenhum depoimento ainda. Cadastre no admin.</p>
      ) : (
        <div className="snap-x-row px-4 pb-6 sm:px-5 md:px-12">
          {testimonials.map((item) => {
            const yt = item.youtubeUrl ? youtubeEmbedUrl(item.youtubeUrl) : null;
            return (
              <article key={item.id} className="w-[min(86vw,26rem)] shrink-0 border border-line bg-bg-secondary">
                {yt ? (
                  <div className="aspect-video">
                    <iframe title={item.title} src={yt} className="h-full w-full" allowFullScreen />
                  </div>
                ) : item.video ? (
                  <video src={item.video} className="aspect-video w-full object-cover" controls playsInline />
                ) : item.image ? (
                  <div className="relative aspect-[4/5]">
                    <MediaImage src={item.image} alt={item.name} fill className="object-cover" sizes="420px" />
                  </div>
                ) : null}
                <div className="p-5">
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <p className="mt-3 text-sm text-ink-secondary">{item.description}</p>
                  <p className="label-mono mt-4">{item.name}</p>
                  {item.artistName && item.artistSlug ? (
                    <p className="mt-1 text-xs text-ink-muted">
                      Artista:{" "}
                      <Link href={`/artistas/${item.artistSlug}`} className="text-ink-secondary underline-offset-2 hover:underline">
                        {item.artistName}
                      </Link>
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
