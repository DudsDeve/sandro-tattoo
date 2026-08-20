"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });
  return (
    <motion.div
      className="fixed left-0 top-0 z-[71] h-[3px] origin-left bg-moss"
      style={{ scaleX }}
    />
  );
}
