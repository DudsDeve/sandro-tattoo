import type { Metadata } from "next";
import { QuizContainer } from "@/components/quiz/QuizContainer";
import { getArtists } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quiz de estilo",
  description: "Descubra qual artista do Sandro Tattoo combina com o seu olhar.",
};

export default async function QuizPage() {
  const artists = await getArtists();
  return <QuizContainer artists={artists} />;
}
