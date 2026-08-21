import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStoreProvider } from "@/components/admin/AdminStoreProvider";

export const metadata = {
  title: "Admin — Sandro Tattoo",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminStoreProvider>
      <AdminShell>{children}</AdminShell>
    </AdminStoreProvider>
  );
}
