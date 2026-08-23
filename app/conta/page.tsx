"use client";

import { useRouter } from "next/navigation";
import { CtaLink } from "@/components/ui/CursorLink";
import { useUser } from "@/components/auth/UserProvider";
import { useT } from "@/lib/i18n/LanguageProvider";
import { useEffect } from "react";

export default function AccountPage() {
  const t = useT();
  const router = useRouter();
  const { user, loading, logout } = useUser();

  useEffect(() => {
    if (!loading && !user) router.replace("/entrar?next=/conta");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="page-shell">
        <p className="text-ink-secondary">{t.auth.wait}</p>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-xl">
      <p className="label-mono">{t.auth.accountLabel}</p>
      <h1 className="display-section mt-4">{t.auth.hello.replace("{name}", user.name.split(" ")[0])}</h1>
      <p className="mt-4 text-ink-secondary">{user.email}</p>
      <p className="mt-8 text-ink-secondary">{t.auth.accountLead}</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <CtaLink href="/agendar" variant="outline">
          {t.nav.book}
        </CtaLink>
        <CtaLink href="/referencias" variant="outline">
          {t.nav.references}
        </CtaLink>
        <button
          type="button"
          className="border border-line px-5 py-3 text-sm text-ink-secondary"
          onClick={async () => {
            await logout();
            router.push("/");
            router.refresh();
          }}
        >
          {t.auth.logout}
        </button>
      </div>
    </div>
  );
}
