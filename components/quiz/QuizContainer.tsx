"use client";

import { useReducer } from "react";
import { AnimatePresence } from "framer-motion";
import { quizQuestions } from "@/lib/data/content";
import { matchArtists, mergeWeights, topStyles } from "@/lib/quiz-engine";
import type { StyleVector } from "@/lib/types";
import { QuizQuestionView } from "@/components/quiz/QuizQuestion";
import { QuizLoading } from "@/components/quiz/QuizLoading";
import { QuizResult } from "@/components/quiz/QuizResult";
import { QuizProgress } from "@/components/quiz/QuizProgress";

type State =
  | { phase: "ask"; index: number; weights: StyleVector[] }
  | { phase: "load"; weights: StyleVector[] }
  | { phase: "result"; weights: StyleVector[]; explanation: string };

type Action =
  | { type: "answer"; weights: StyleVector }
  | { type: "loaded"; explanation: string }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  if (action.type === "reset") return { phase: "ask", index: 0, weights: [] };
  if (action.type === "answer" && state.phase === "ask") {
    const weights = [...state.weights, action.weights];
    if (state.index + 1 >= quizQuestions.length) return { phase: "load", weights };
    return { phase: "ask", index: state.index + 1, weights };
  }
  if (action.type === "loaded" && state.phase === "load") {
    return { phase: "result", weights: state.weights, explanation: action.explanation };
  }
  return state;
}

export function QuizContainer() {
  const [state, dispatch] = useReducer(reducer, { phase: "ask", index: 0, weights: [] });

  const finish = async (weights: StyleVector[]) => {
    const preference = mergeWeights(weights);
    const matches = matchArtists(preference);
    const top = matches[0];
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        styles: topStyles(preference),
        artist: top?.artist.name,
        percent: top?.percent,
      }),
    });
    const data = (await res.json()) as { explanation?: string };
    dispatch({
      type: "loaded",
      explanation:
        data.explanation ??
        `Seu olhar puxa para ${topStyles(preference).join(", ")}. ${top?.artist.name} é o encaixe mais honesto nesse espectro.`,
    });
  };

  return (
    <div className="flex min-h-[100svh] flex-col bg-black px-5 pt-28 md:px-12">
      {state.phase === "ask" && (
        <QuizProgress current={state.index} total={quizQuestions.length} />
      )}
      <AnimatePresence mode="wait">
        {state.phase === "ask" && (
          <QuizQuestionView
            key={quizQuestions[state.index].id}
            question={quizQuestions[state.index]}
            onPick={(weights) => {
              const nextIndex = state.index + 1;
              const nextWeights = [...state.weights, weights];
              dispatch({ type: "answer", weights });
              if (nextIndex >= quizQuestions.length) {
                void finish(nextWeights);
              }
            }}
          />
        )}
        {state.phase === "load" && <QuizLoading key="load" />}
        {state.phase === "result" && (
          <QuizResult
            key="result"
            matches={matchArtists(mergeWeights(state.weights))}
            explanation={state.explanation}
            onReset={() => dispatch({ type: "reset" })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
