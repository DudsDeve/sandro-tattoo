"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "@/components/ui/LogoMark";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { CtaLink, CursorLink } from "@/components/ui/CursorLink";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const t = useT();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/artistas", label: t.nav.artists },
    { href: "/galeria", label: t.nav.gallery },
    { href: "/virtual-tryout", label: t.nav.tryOn },
    { href: "/processo", label: t.nav.process },
    { href: "/blog", label: t.nav.blog },
    { href: "/wishlist", label: t.nav.wishlist },
  ];

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
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-[72px] sm:gap-3 sm:px-5 md:px-8">
          <CursorLink href="/" className="relative block h-8 w-[6.75rem] shrink-0 overflow-hidden sm:h-11 sm:w-[10rem]">
            <LogoMark className="absolute inset-0 h-full w-full max-h-full max-w-full object-contain object-left" />
          </CursorLink>

          <nav className="hidden min-w-0 items-center gap-4 overflow-x-auto lg:flex xl:gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navLinks.map((link) => (
              <CursorLink
                key={link.href}
                href={link.href}
                className="text-sm text-ink-secondary transition-colors hover:text-ink"
              >
                {link.label}
              </CursorLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <div className="hidden md:block">
              <CtaLink href="/agendar" variant="outline">
                {t.nav.book}
              </CtaLink>
            </div>
            <button
              className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
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
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                >
                  <CursorLink href={link.href} className="font-display text-[clamp(1.45rem,6vw,2.15rem)] leading-tight">
                    <span onClick={() => setOpen(false)}>{link.label}</span>
                  </CursorLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-col gap-4"
              >
                <LanguageSwitcher className="w-fit" />
                <span onClick={() => setOpen(false)}>
                  <CtaLink href="/agendar">{t.nav.book}</CtaLink>
                </span>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
