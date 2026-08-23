"use client";

import { CursorLink } from "@/components/ui/CursorLink";
import { useUser } from "@/components/auth/UserProvider";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function AccountNav({ className }: { className?: string }) {
  const t = useT();
  const { user, loading } = useUser();
  if (loading) return null;
  return (
    <CursorLink
      href={user ? "/conta" : "/entrar"}
      className={cn("text-sm text-ink-secondary transition-colors hover:text-ink", className)}
    >
      {user ? user.name.split(" ")[0] : t.nav.login}
    </CursorLink>
  );
}
