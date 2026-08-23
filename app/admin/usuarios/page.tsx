"use client";

import { useEffect, useState } from "react";
import type { SiteUser } from "@/lib/auth/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d: { users?: SiteUser[] }) => setUsers(d.users || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[#a09b95]">Carregando…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Usuários</h1>
        <p className="mt-2 text-[#a09b95]">Contas criadas no login do site ({users.length}).</p>
      </div>
      {!users.length ? (
        <p className="text-[#a09b95]">Nenhuma conta ainda.</p>
      ) : (
        <div className="overflow-x-auto border border-[#1a1a1a]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111] text-[#8b9a6b]">
              <tr>
                <th className="px-4 py-3 font-normal">Nome</th>
                <th className="px-4 py-3 font-normal">E-mail</th>
                <th className="px-4 py-3 font-normal">Criado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[#1a1a1a]">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-[#a09b95]">{u.email}</td>
                  <td className="px-4 py-3 text-[#a09b95]">
                    {new Date(u.createdAt).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
