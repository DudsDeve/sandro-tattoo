import type { Metadata } from "next";
import { QuizContainer } from "@/components/quiz/QuizContainer";
import { getArtists, getSpecialties } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quiz de estilo",
  description: "Descubra qual artista do VERSUS combina com o seu olhar.",
};

export default async function QuizPage() {
  const [artists, specialties] = await Promise.all([getArtists(), getSpecialties()]);
  return <QuizContainer artists={artists} specialties={specialties} />;
}
