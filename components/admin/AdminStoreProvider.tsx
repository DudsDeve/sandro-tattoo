"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { CmsStore } from "@/lib/cms/types";

type Ctx = {
  store: CmsStore | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setStore: (s: CmsStore) => void;
};

const AdminStoreContext = createContext<Ctx | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [store, setStore] = useState<CmsStore | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/store", { cache: "no-store" });
      if (res.ok) setStore(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (path === "/admin/login") {
      setLoading(false);
      return;
    }
    void refresh();
  }, [path, refresh]);

  return (
    <AdminStoreContext.Provider value={{ store, loading, refresh, setStore }}>
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore fora do provider");
  return ctx;
}
