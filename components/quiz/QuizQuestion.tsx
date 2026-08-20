"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { QuizQuestion, StyleVector } from "@/lib/types";

export function QuizQuestionView({
  question,
  onPick,
}: {
  question: QuizQuestion;
  onPick: (weights: StyleVector) => void;
}) {
  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      className="pb-24"
    >
      <h1 className="display-section max-w-4xl">{question.prompt}</h1>
      {question.hint && <p className="mt-3 text-ink-secondary">{question.hint}</p>}
      <div className={`mt-12 grid gap-4 ${question.options.length > 3 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {question.options.map((opt) =>
          question.type === "image" && opt.image ? (
            <button
              key={opt.id}
              onClick={() => onPick(opt.weights)}
              className="group relative aspect-[3/4] overflow-hidden border border-transparent hover:border-line-accent"
            >
              <Image src={opt.image} alt={opt.label} fill className="object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-4 font-display text-2xl">
                {opt.label}
              </span>
            </button>
          ) : (
            <button
              key={opt.id}
              onClick={() => onPick(opt.weights)}
              className="border border-line p-8 text-left transition hover:border-line-accent hover:bg-bg-accent/20"
            >
              <span className="font-display text-4xl text-moss">{opt.icon}</span>
              <span className="mt-4 block text-lg">{opt.label}</span>
            </button>
          ),
        )}
      </div>
    </motion.div>
  );
}
