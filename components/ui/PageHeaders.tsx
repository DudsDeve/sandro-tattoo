"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

export function ArtistsPageHeader() {
  const t = useT();
  return (
    <>
      <p className="label-mono">{t.pages.artistsLabel}</p>
      <h1 className="display-section mt-4 max-w-4xl">{t.pages.artistsTitle}</h1>
    </>
  );
}

export function GalleryPageHeader() {
  const t = useT();
  return (
    <>
      <p className="label-mono">{t.pages.galleryLabel}</p>
      <h1 className="display-section mt-4 mb-12">{t.pages.galleryTitle}</h1>
    </>
  );
}

export function ShopPageHeader() {
  const t = useT();
  return (
    <>
      <p className="label-mono">{t.pages.shopLabel}</p>
      <h1 className="display-section mt-4">{t.pages.shopTitle}</h1>
    </>
  );
}

export function BlogPageHeader() {
  const t = useT();
  return (
    <>
      <p className="label-mono">{t.pages.blogLabel}</p>
      <h1 className="display-section mt-4 mb-16">{t.pages.blogTitle}</h1>
    </>
  );
}

export function BookPageHeader() {
  const t = useT();
  return (
    <>
      <p className="label-mono">{t.pages.bookLabel}</p>
      <h1 className="display-section mt-4 mb-16">{t.pages.bookTitle}</h1>
    </>
  );
}

export function SimPageHeader() {
  const t = useT();
  return (
    <>
      <p className="label-mono">{t.pages.simLabel}</p>
      <h1 className="display-section mt-4 mb-4">{t.pages.simTitle}</h1>
      <p className="mb-12 max-w-xl text-ink-secondary">{t.pages.simBody}</p>
    </>
  );
}
