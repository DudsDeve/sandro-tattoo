"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "@/components/ui/LogoMark";
import { CtaLink, CursorLink } from "@/components/ui/CursorLink";
import { NAV_LINKS, STUDIO } from "@/lib/data/studio";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 2.1 }}
        className={cn(
          "fixed inset-x-0 top-0 z-40 border-b border-transparent pt-[env(safe-area-inset-top)] transition-colors duration-500",
          scrolled && "border-line bg-black/80 backdrop-blur-[12px]",
        )}
      >
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:h-[72px] sm:px-5 md:px-8">
          <CursorLink href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <LogoMark compact={scrolled} className="h-9 w-9 shrink-0 text-ink sm:h-10 sm:w-10" />
            <span className="font-display truncate text-base tracking-tight sm:text-lg">
              {scrolled ? "S" : STUDIO.name}
            </span>
          </CursorLink>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <CursorLink
                key={link.href}
                href={link.href}
                className="text-sm text-ink-secondary transition-colors hover:text-ink"
              >
                {link.label}
              </CursorLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden md:block">
              <CtaLink href="/agendar" variant="outline">
                Agendar Sessão
              </CtaLink>
            </div>
            <button
              className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
            >
              <span
                className={cn(
                  "h-px w-6 bg-ink transition-transform duration-300",
                  open && "translate-y-[4px] rotate-45",
                )}
              />
              <span className={cn("h-px w-6 bg-ink transition-opacity duration-300", open && "opacity-0")} />
              <span
                className={cn(
                  "h-px w-6 bg-ink transition-transform duration-300",
                  open && "-translate-y-[8px] -rotate-45",
                )}
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col justify-end overflow-y-auto bg-black px-6 pb-[max(4rem,env(safe-area-inset-bottom))] pt-28 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                >
                  <CursorLink href={link.href} className="font-display text-[clamp(2rem,10vw,3.5rem)] leading-none">
                    <span onClick={() => setOpen(false)}>{link.label}</span>
                  </CursorLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <span onClick={() => setOpen(false)}>
                  <CtaLink href="/agendar">Agendar Sessão</CtaLink>
                </span>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
