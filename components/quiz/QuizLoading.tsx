"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/ui/LogoMark";

export function QuizLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-1 flex-col items-center justify-center pb-32"
    >
      <LogoMark animate className="h-20 w-20 text-ink" />
      <p className="font-script mt-6 text-3xl">Lendo o seu traço…</p>
    </motion.div>
  );
}
