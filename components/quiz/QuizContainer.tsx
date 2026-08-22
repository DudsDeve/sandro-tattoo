"use client";

import { useMemo, useReducer } from "react";
import { AnimatePresence } from "framer-motion";
import { matchArtists, mergeWeights, topStyles } from "@/lib/quiz-engine";
import { buildQuizQuestions } from "@/lib/quiz-questions";
import type { Artist, Specialty, StyleVector } from "@/lib/types";
import { QuizQuestionView } from "@/components/quiz/QuizQuestion";
import { QuizLoading } from "@/components/quiz/QuizLoading";
import { QuizResult } from "@/components/quiz/QuizResult";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localizeQuizQuestion } from "@/lib/i18n/localize";

type State =
  | { phase: "ask"; index: number; weights: StyleVector[] }
  | { phase: "load"; weights: StyleVector[] }
  | { phase: "result"; weights: StyleVector[]; explanation: string };

type Action =
  | { type: "answer"; weights: StyleVector; done?: boolean }
  | { type: "loaded"; explanation: string }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  if (action.type === "reset") return { phase: "ask", index: 0, weights: [] };
  if (action.type === "answer" && state.phase === "ask") {
    const weights = [...state.weights, action.weights];
    if (action.done) return { phase: "load", weights };
    return { phase: "ask", index: state.index + 1, weights };
  }
  if (action.type === "loaded" && state.phase === "load") {
    return { phase: "result", weights: state.weights, explanation: action.explanation };
  }
  return state;
}

export function QuizContainer({
  artists = [],
  specialties = [],
}: {
  artists?: Artist[];
  specialties?: Specialty[];
}) {
  const { locale, t } = useLanguage();
  const questions = useMemo(() => buildQuizQuestions(specialties, locale), [specialties, locale]);
  const [state, dispatch] = useReducer(reducer, { phase: "ask", index: 0, weights: [] });

  if (!specialties.length) {
    return (
      <div className="flex min-h-[100svh] flex-col bg-black px-4 pt-24 sm:px-5 md:px-12 md:pt-28">
        <p className="label-mono">{t.pages.quizLabel}</p>
        <h1 className="display-section mt-4 max-w-3xl">
          {locale === "pt"
            ? "Nenhuma categoria cadastrada."
            : "No styles registered yet."}
        </h1>
        <p className="mt-4 max-w-lg text-ink-secondary">
          {locale === "pt"
            ? "Cadastre categorias no admin para o quiz listar os estilos do estúdio."
            : "Add categories in the admin so the quiz lists the studio’s styles."}
        </p>
      </div>
    );
  }

  const finish = async (weights: StyleVector[]) => {
    const preference = mergeWeights(weights);
    const matches = matchArtists(preference, artists);
    const top = matches[0];
    const styles = topStyles(preference).join(", ");
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        styles: topStyles(preference),
        artist: top?.artist.name,
        percent: top?.percent,
        locale,
      }),
    });
    const data = (await res.json()) as { explanation?: string };
    dispatch({
      type: "loaded",
      explanation:
        data.explanation ??
        t.quiz.fallback.replace("{styles}", styles).replace("{artist}", top?.artist.name ?? ""),
    });
  };

  return (
    <div className="flex min-h-[100svh] flex-col bg-black px-4 pt-24 sm:px-5 md:px-12 md:pt-28">
      {state.phase === "ask" && (
        <QuizProgress current={state.index} total={questions.length} />
      )}
      <AnimatePresence mode="wait">
        {state.phase === "ask" && questions[state.index] && (
          <QuizQuestionView
            key={questions[state.index].id}
            question={localizeQuizQuestion(locale, questions[state.index])}
            onPick={(weights) => {
              const done = state.index + 1 >= questions.length;
              const nextWeights = [...state.weights, weights];
              dispatch({ type: "answer", weights, done });
              if (done) void finish(nextWeights);
            }}
          />
        )}
        {state.phase === "load" && <QuizLoading key="load" />}
        {state.phase === "result" && (
          <QuizResult
            key="result"
            matches={matchArtists(mergeWeights(state.weights), artists)}
            explanation={state.explanation}
            onReset={() => dispatch({ type: "reset" })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

