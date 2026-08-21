"use client";

import { EditableText } from "@/components/site-editor/Editable";
import { useT } from "@/lib/i18n/LanguageProvider";

export function ArtistsPageHeader() {
  const t = useT();
  return (
    <>
      <EditableText id="page.artists.label" as="p" className="label-mono">
        {t.pages.artistsLabel}
      </EditableText>
      <EditableText id="page.artists.title" as="h1" className="display-section mt-4 max-w-4xl">
        {t.pages.artistsTitle}
      </EditableText>
    </>
  );
}

export function GalleryPageHeader() {
  const t = useT();
  return (
    <>
      <EditableText id="page.gallery.label" as="p" className="label-mono">
        {t.pages.galleryLabel}
      </EditableText>
      <EditableText id="page.gallery.title" as="h1" className="display-section mt-4 mb-12">
        {t.pages.galleryTitle}
      </EditableText>
    </>
  );
}

export function ShopPageHeader() {
  const t = useT();
  return (
    <>
      <EditableText id="page.shop.label" as="p" className="label-mono">
        {t.pages.shopLabel}
      </EditableText>
      <EditableText id="page.shop.title" as="h1" className="display-section mt-4">
        {t.pages.shopTitle}
      </EditableText>
    </>
  );
}

export function BlogPageHeader() {
  const t = useT();
  return (
    <>
      <EditableText id="page.blog.label" as="p" className="label-mono">
        {t.pages.blogLabel}
      </EditableText>
      <EditableText id="page.blog.title" as="h1" className="display-section mt-4 mb-16">
        {t.pages.blogTitle}
      </EditableText>
    </>
  );
}

export function BookPageHeader() {
  const t = useT();
  return (
    <>
      <EditableText id="page.book.label" as="p" className="label-mono">
        {t.pages.bookLabel}
      </EditableText>
      <EditableText id="page.book.title" as="h1" className="display-section mt-4 mb-16">
        {t.pages.bookTitle}
      </EditableText>
    </>
  );
}

export function SimPageHeader() {
  const t = useT();
  return (
    <>
      <EditableText id="page.sim.label" as="p" className="label-mono">
        {t.pages.simLabel}
      </EditableText>
      <EditableText id="page.sim.title" as="h1" className="display-section mt-4 mb-4">
        {t.pages.simTitle}
      </EditableText>
      <EditableText id="page.sim.body" as="p" className="mb-12 max-w-xl text-ink-secondary">
        {t.pages.simBody}
      </EditableText>
    </>
  );
}
