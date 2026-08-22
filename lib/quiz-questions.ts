import { quizQuestions } from "@/lib/data/content";
import { localizeSpecialty } from "@/lib/i18n/localize";
import type { Locale } from "@/lib/i18n/config";
import type { QuizQuestion, Specialty } from "@/lib/types";

const ICONS = ["■", "◎", "┄", "★", "✿", "◇", "☯", "☽", "▲", "●"];

export function buildQuizQuestions(categories: Specialty[], locale: Locale): QuizQuestion[] {
  const rest = quizQuestions.slice(1);
  if (!categories.length) return rest;

  const list = categories.map((s) => localizeSpecialty(locale, s));
  const styleQuestion: QuizQuestion = {
    ...quizQuestions[0],
    options: list.map((cat, i) => ({
      id: cat.slug,
      label: cat.name,
      icon: ICONS[i % ICONS.length],
      weights: { [cat.slug]: 3 },
    })),
  };

  return [styleQuestion, ...rest];
}
