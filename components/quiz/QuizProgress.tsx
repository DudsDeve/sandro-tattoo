"use client";

import { motion } from "framer-motion";

export function QuizProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-10">
      <p className="label-mono mb-2">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
      <div className="h-[2px] bg-line">
        <motion.div
          className="h-full bg-bg-accent-light"
          initial={false}
          animate={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
