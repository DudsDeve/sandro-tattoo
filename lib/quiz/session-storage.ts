import type { Locale } from "@/lib/i18n/config";

export type QuizAnswer = {
  questionId: string;
  prompt: string;
  label: string;
};

export type QuizSession = {
  answers: QuizAnswer[];
  artistSlug?: string;
  artistName?: string;
  percent?: number;
  explanation?: string;
  timestamp: number;
};

const KEY = "versus_quiz";

export function saveQuizSession(data: QuizSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
}

export function patchQuizSession(partial: Partial<QuizSession>): QuizSession {
  const prev = getQuizFromSession() ?? { answers: [], timestamp: Date.now() };
  const next: QuizSession = { ...prev, ...partial, timestamp: Date.now() };
  saveQuizSession(next);
  return next;
}

export function getQuizFromSession(): QuizSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as QuizSession;
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearQuizSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

export function buildQuizIdeaText(session: QuizSession, locale: Locale): string {
  const header =
    locale === "pt"
      ? "★ FIND YOUR STYLE\nEsta ideia foi gerada no Find your style.\n"
      : "★ FIND YOUR STYLE\nThis idea was generated in Find your style.\n";
  const answers = (session.answers || [])
    .map((a) => `• ${a.prompt} → ${a.label}`)
    .join("\n");
  const match =
    session.artistName && session.percent != null
      ? locale === "pt"
        ? `\n\nArtista sugerido: ${session.artistName} (${session.percent}% match)`
        : `\n\nSuggested artist: ${session.artistName} (${session.percent}% match)`
      : "";
  const explanation = session.explanation ? `\n${session.explanation}` : "";
  return `${header}\n${answers}${match}${explanation}`.trim();
}

