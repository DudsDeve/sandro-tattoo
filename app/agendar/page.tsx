import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookPageHeader } from "@/components/ui/PageHeaders";
import { getArtists } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book",
  description: "Book a consultation and session at VERSUS in a few steps.",
};

export default async function AgendarPage() {
  const artists = await getArtists();
  return (
    <div className="page-shell">
      <BookPageHeader />
      <Suspense>
        <BookingForm artists={artists} />
      </Suspense>
    </div>
  );
}
