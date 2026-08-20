import type { Metadata } from "next";
import { QuizContainer } from "@/components/quiz/QuizContainer";

export const metadata: Metadata = {
  title: "Quiz de estilo",
  description: "Descubra qual artista do Sandro Tattoo combina com o seu olhar.",
};

export default function QuizPage() {
  return <QuizContainer />;
}
