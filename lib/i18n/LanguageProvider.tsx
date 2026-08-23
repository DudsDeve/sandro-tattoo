"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n/config";
import { en, type Messages } from "@/lib/i18n/messages/en";
import { pt } from "@/lib/i18n/messages/pt";

const DICTS: Record<Locale, Messages> = { en, pt };
const LOCALE_EVENT = "versus-locale";

type Ctx = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const LanguageContext = createContext<Ctx | null>(null);

function parseLocale(raw: string | null, fallback: Locale): Locale {
  return raw === "en" || raw === "pt" ? raw : fallback;
}

function readStoredLocale(storageKey: string, fallback: Locale): Locale {
  if (typeof window === "undefined") return fallback;
  return parseLocale(window.localStorage.getItem(storageKey), fallback);
}

function persistLocale(locale: Locale, storageKey: string, persistHtml: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, locale);
  if (persistHtml) {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }
}

export function LanguageProvider({
  children,
  storageKey = LOCALE_STORAGE_KEY,
  defaultLocale = DEFAULT_LOCALE,
  persistHtml = true,
}: {
  children: ReactNode;
  storageKey?: string;
  defaultLocale?: Locale;
  persistHtml?: boolean;
}) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale(storageKey, defaultLocale));
    setReady(true);
  }, [storageKey, defaultLocale]);

  useEffect(() => {
    if (!ready) return;
    persistLocale(locale, storageKey, persistHtml);
  }, [locale, ready, storageKey, persistHtml]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: DICTS[locale] ?? en,
    }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    if (ctx) return;
    const sync = () => setLocaleState(readStoredLocale(LOCALE_STORAGE_KEY, DEFAULT_LOCALE));
    sync();
    window.addEventListener(LOCALE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LOCALE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [ctx]);

  if (ctx) return ctx;

  return {
    locale,
    setLocale: (next: Locale) => {
      setLocaleState(next);
      persistLocale(next, LOCALE_STORAGE_KEY, true);
    },
    t: DICTS[locale] ?? en,
  };
}

export function useT() {
  return useLanguage().t;
}
