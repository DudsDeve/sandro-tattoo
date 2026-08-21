export type Locale = "en" | "pt";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "st_locale";

export const LOCALES: Array<{ code: Locale; label: string; flag: string; aria: string }> = [
  { code: "en", label: "EN", flag: "🇬🇧", aria: "Switch to English" },
  { code: "pt", label: "PT", flag: "🇧🇷", aria: "Mudar para português" },
];
