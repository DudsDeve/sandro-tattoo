import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <Suspense fallback={<p className="text-ink-secondary">…</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
