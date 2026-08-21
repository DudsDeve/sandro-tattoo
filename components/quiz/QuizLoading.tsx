"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/ui/LogoMark";
import { useT } from "@/lib/i18n/LanguageProvider";

export function QuizLoading() {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-1 flex-col items-center justify-center pb-32"
    >
      <LogoMark animate className="h-20 w-20 text-ink" />
      <p className="font-script mt-6 text-3xl">{t.quiz.loading}</p>
    </motion.div>
  );
}
