"use client";

import { WaitingModePlayer } from "@/components/admin/WaitingModePlayer";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";

export default function WaitingTvPage() {
  const { store, loading } = useAdminStore();
  if (loading || !store) {
    return <div className="flex h-screen items-center justify-center bg-black text-[#a09b95]">Carregando espera…</div>;
  }
  return <WaitingModePlayer store={store} />;
}
