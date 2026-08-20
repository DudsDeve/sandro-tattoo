import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/BookingForm";

export const metadata: Metadata = {
  title: "Agendar",
  description: "Marque consulta e sessão no Sandro Tattoo em poucos passos.",
};

export default function AgendarPage() {
  return (
    <div className="px-4 pb-28 pt-28 sm:px-5 md:px-12 md:pt-32">
      <p className="label-mono">Agendamento</p>
      <h1 className="display-section mt-4 mb-16">Seis passos. Zero catálogo.</h1>
      <Suspense>
        <BookingForm />
      </Suspense>
    </div>
  );
}
