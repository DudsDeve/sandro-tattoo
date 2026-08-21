import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookPageHeader } from "@/components/ui/PageHeaders";

export const metadata: Metadata = {
  title: "Book",
  description: "Book a consultation and session at Sandro Tattoo in a few steps.",
};

export default function AgendarPage() {
  return (
    <div className="px-4 pb-28 pt-28 sm:px-5 md:px-12 md:pt-32">
      <BookPageHeader />
      <Suspense>
        <BookingForm />
      </Suspense>
    </div>
  );
}
