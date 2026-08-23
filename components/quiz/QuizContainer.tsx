"use client";

import { useMemo, useReducer } from "react";
import { AnimatePresence } from "framer-motion";
import { matchArtists, mergeWeights, topStyles } from "@/lib/quiz-engine";
import { buildQuizQuestions } from "@/lib/quiz-questions";
import type { Artist, QuizOption, Specialty, StyleVector } from "@/lib/types";
import { QuizQuestionView } from "@/components/quiz/QuizQuestion";
import { QuizLoading } from "@/components/quiz/QuizLoading";
import { QuizResult } from "@/components/quiz/QuizResult";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localizeQuizQuestion } from "@/lib/i18n/localize";
import { clearQuizSession, patchQuizSession, type QuizAnswer } from "@/lib/quiz/session-storage";

type State =
  | { phase: "ask"; index: number; weights: StyleVector[]; answers: QuizAnswer[] }
  | { phase: "load"; weights: StyleVector[]; answers: QuizAnswer[] }
  | { phase: "result"; weights: StyleVector[]; answers: QuizAnswer[]; explanation: string };

type Action =
  | { type: "answer"; weights: StyleVector; answer: QuizAnswer; done?: boolean }
  | { type: "loaded"; explanation: string }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  if (action.type === "reset") return { phase: "ask", index: 0, weights: [], answers: [] };
  if (action.type === "answer" && state.phase === "ask") {
    const weights = [...state.weights, action.weights];
    const answers = [...state.answers, action.answer];
    if (action.done) return { phase: "load", weights, answers };
    return { phase: "ask", index: state.index + 1, weights, answers };
  }
  if (action.type === "loaded" && state.phase === "load") {
    return { phase: "result", weights: state.weights, answers: state.answers, explanation: action.explanation };
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
  const [state, dispatch] = useReducer(reducer, { phase: "ask", index: 0, weights: [], answers: [] });

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

  const finish = async (weights: StyleVector[], answers: QuizAnswer[]) => {
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
    const explanation =
      data.explanation ??
      t.quiz.fallback.replace("{styles}", styles).replace("{artist}", top?.artist.name ?? "");
    patchQuizSession({
      answers,
      artistSlug: top?.artist.slug,
      artistName: top?.artist.name,
      percent: top?.percent,
      explanation,
    });
    dispatch({
      type: "loaded",
      explanation,
    });
  };

  return (
    <div className="flex min-h-[100svh] flex-col bg-black px-4 pb-[max(6rem,env(safe-area-inset-bottom)+4rem)] pt-24 sm:px-5 md:px-12 md:pt-28">
      {state.phase === "ask" && (
        <QuizProgress current={state.index} total={questions.length} />
      )}
      <AnimatePresence mode="wait">
        {state.phase === "ask" && questions[state.index] && (
          <QuizQuestionView
            key={questions[state.index].id}
            question={localizeQuizQuestion(locale, questions[state.index])}
            onPick={(option: QuizOption) => {
              const q = localizeQuizQuestion(locale, questions[state.index]);
              const answer: QuizAnswer = { questionId: q.id, prompt: q.prompt, label: option.label };
              const done = state.index + 1 >= questions.length;
              const nextAnswers = [...state.answers, answer];
              const nextWeights = [...state.weights, option.weights];
              patchQuizSession({ answers: nextAnswers });
              dispatch({ type: "answer", weights: option.weights, answer, done });
              if (done) void finish(nextWeights, nextAnswers);
            }}
          />
        )}
        {state.phase === "load" && <QuizLoading key="load" />}
        {state.phase === "result" && (
          <QuizResult
            key="result"
            matches={matchArtists(mergeWeights(state.weights), artists)}
            explanation={state.explanation}
            onReset={() => {
              clearQuizSession();
              dispatch({ type: "reset" });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

