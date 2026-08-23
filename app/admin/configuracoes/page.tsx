"use client";

import { useEffect, useState } from "react";
import { DEFAULT_TRYOUT_MODEL } from "@/lib/tryout/models";

type ModelOption = { id: string; name: string; description: string };

export default function AdminSettingsPage() {
  const [gemini, setGemini] = useState(false);
  const [tail, setTail] = useState("");
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [tryoutModelId, setTryoutModelId] = useState<string>(DEFAULT_TRYOUT_MODEL);

  async function load() {
    const res = await fetch("/api/admin/ai-keys");
    const data = (await res.json()) as {
      gemini?: boolean;
      geminiTail?: string;
      tryoutModelId?: string;
      models?: ModelOption[];
    };
    setGemini(Boolean(data.gemini));
    setTail(data.geminiTail || "");
    setModels(data.models ?? []);
    if (data.tryoutModelId) setTryoutModelId(data.tryoutModelId);
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveKey() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/ai-keys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ geminiApiKey: key }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Erro ao salvar");
      return;
    }
    setKey("");
    setMsg("Chave Gemini salva.");
    await load();
  }

  async function saveModel() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/ai-keys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tryoutModelId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Erro ao salvar");
      return;
    }
    setMsg("Modelo do provador salvo.");
    await load();
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Configurações</h1>
        <p className="mt-2 text-[#a09b95]">Chaves e modelo de IA do provador virtual. Não ficam no Git.</p>
      </div>
      <div className="space-y-3 border border-[#1a1a1a] bg-[#111] p-5">
        <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">MODELO DO PROVADOR</p>
        <p className="text-sm text-[#a09b95]">
          O visitante não escolhe modelo. O fluxo público usa sempre o que estiver aqui. Padrão: Gemini 2.5 Flash Image.
        </p>
        <select
          className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
          value={tryoutModelId}
          onChange={(e) => setTryoutModelId(e.target.value)}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <button type="button" disabled={busy} onClick={() => void saveModel()} className="bg-[#4c5634] px-4 py-3 text-sm text-white disabled:opacity-40">
          Salvar modelo
        </button>
      </div>
      <div className="space-y-3 border border-[#1a1a1a] bg-[#111] p-5">
        <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">GEMINI</p>
        <p className="text-sm">
          {gemini ? `GEMINI_API_KEY ativa (…${tail}).` : "Ainda não configurada."}
        </p>
        <input
          type="password"
          autoComplete="off"
          className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
          placeholder="Cole a chave Gemini (AI Studio)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button type="button" disabled={busy || !key.trim()} onClick={() => void saveKey()} className="bg-[#4c5634] px-4 py-3 text-sm text-white disabled:opacity-40">
          Salvar chave Gemini
        </button>
        {msg && <p className="text-sm text-[#8b9a6b]">{msg}</p>}
        <p className="text-xs text-[#5c5955]">
          Em produção, defina também GEMINI_API_KEY na Vercel (Settings → Environment Variables) e faça redeploy.
        </p>
      </div>
    </div>
  );
}
