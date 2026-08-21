"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { CtaLink } from "@/components/ui/CursorLink";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { ArtistMatch } from "@/lib/quiz-engine";

export function QuizResult({
  matches,
  explanation,
  onReset,
}: {
  matches: ArtistMatch[];
  explanation: string;
  onReset: () => void;
}) {
  const t = useT();
  const [top, ...rest] = matches;
  if (!top) return null;

  return (
    <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="pb-24">
      <p className="label-mono">{t.quiz.match}</p>
      <div className="mt-8 grid items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image src={top.artist.image} alt={top.artist.name} fill className="object-cover" />
        </div>
        <div>
          <h2 className="display-section">{top.artist.name}</h2>
          <p className="mt-2 font-display text-5xl text-moss">
            <AnimatedCounter to={top.percent} suffix="%" /> match
          </p>
          <p className="mt-6 text-ink-secondary">{explanation}</p>
          <div className="mt-6 flex gap-2 overflow-x-auto">
            {top.artist.works.slice(0, 4).map((w) => (
              <div key={w} className="relative h-16 w-16 shrink-0 overflow-hidden sm:h-20 sm:w-20">
                <Image src={w} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <CtaLink href={`/agendar?artista=${top.artist.slug}`}>
              {t.quiz.bookWith} {top.artist.name.split(" ")[0]}
            </CtaLink>
            <CtaLink href={`/artistas/${top.artist.slug}`} variant="outline">
              {t.quiz.seeProfile}
            </CtaLink>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <p className="label-mono mb-4">{t.quiz.other}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {rest.slice(0, 2).map((m) => (
            <div key={m.artist.slug} className="flex items-center gap-4 border border-line p-4">
              <div className="relative h-16 w-16 overflow-hidden">
                <Image src={m.artist.image} alt="" fill className="object-cover" />
              </div>
              <div>
                <p className="font-display text-2xl">{m.artist.name}</p>
                <p className="text-moss">{m.percent}%</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onReset} className="mt-8 text-sm text-ink-secondary underline">
          {t.quiz.redo}
        </button>
      </div>
    </motion.div>
  );
}
