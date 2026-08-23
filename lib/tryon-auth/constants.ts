export const TRYON_CONFIG = {
  MONTHLY_LIMIT: 3,
  UNLIMITED_EMAIL: "teste@teste.com",
  CONFIRMATION_EXPIRY_HOURS: 24,
  SESSION_COOKIE_NAME: "tryon_session",
  SESSION_EXPIRY_DAYS: 30,
  REGISTER_MAX_PER_HOUR: 5,
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export function isUnlimitedEmail(email: string) {
  return normalizeEmail(email) === TRYON_CONFIG.UNLIMITED_EMAIL;
}

export function remainingUses(email: string, usesThisMonth: number) {
  if (isUnlimitedEmail(email)) return 999999;
  return Math.max(0, TRYON_CONFIG.MONTHLY_LIMIT - usesThisMonth);
}

export function monthResetDate(from = new Date()) {
  return new Date(from.getFullYear(), from.getMonth() + 1, 1);
}
