"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { artists } from "@/lib/data/content";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CtaLink } from "@/components/ui/CursorLink";
import { cn } from "@/lib/utils";

const schema = z.object({
  artist: z.string().min(1, "Escolha um artista ou peça ajuda"),
  idea: z.string().min(12, "Conta um pouco mais da ideia"),
  bodyPart: z.string().min(2),
  size: z.string().min(1),
  firstTattoo: z.enum(["sim", "nao"]),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  instagram: z.string().optional(),
  slot: z.string().min(1, "Escolha um horário"),
});

type Form = z.infer<typeof schema>;

const STEPS = ["Artista", "Ideia", "Corpo", "Você", "Agenda", "Confirma"];

const SLOTS = ["Qui 10/09 · 14h", "Sex 11/09 · 11h", "Sáb 12/09 · 10h", "Ter 15/09 · 16h"];

export function BookingForm() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      artist: params.get("artista") ?? "",
      idea: "",
      bodyPart: "",
      size: "media",
      firstTattoo: "nao",
      name: "",
      email: "",
      phone: "",
      instagram: "",
      slot: "",
    },
    mode: "onChange",
  });

  const values = form.watch();
  const artist = useMemo(() => artists.find((a) => a.slug === values.artist), [values.artist]);

  const next = async () => {
    const fields: Array<keyof Form>[] = [
      ["artist"],
      ["idea"],
      ["bodyPart", "size", "firstTattoo"],
      ["name", "email", "phone"],
      ["slot"],
      [],
    ];
    const ok = await form.trigger(fields[step]);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = form.handleSubmit(async (data) => {
    await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setDone(true);
  });

  if (done) {
    return (
      <div className="py-24 text-center">
        <p className="label-mono">Confirmado</p>
        <h2 className="display-section mt-4">Pedido enviado.</h2>
        <p className="mx-auto mt-4 max-w-md text-ink-secondary">
          Vamos retornar em até 1 dia útil para fechar depósito e briefing. Guarde o resumo — e se quiser, simule o design enquanto espera.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <CtaLink href="/simular">Simular na pele</CtaLink>
          <CtaLink href="/" variant="outline">
            Voltar
          </CtaLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl">
      <div className="mb-12 flex gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className="h-[2px] bg-line">
              <motion.div
                className="h-full bg-bg-accent-light"
                animate={{ width: i <= step ? "100%" : "0%" }}
              />
            </div>
            <p className={cn("label-mono mt-2 hidden md:block", i === step ? "text-moss" : "text-ink-muted")}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {step === 0 && (
            <div>
              <h2 className="font-display text-4xl">Com quem você quer tatuar?</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {artists.map((a) => (
                  <button
                    type="button"
                    key={a.slug}
                    onClick={() => form.setValue("artist", a.slug, { shouldValidate: true })}
                    className={cn(
                      "flex items-center gap-4 border p-3 text-left",
                      values.artist === a.slug ? "border-line-accent bg-bg-accent/30" : "border-line",
                    )}
                  >
                    <span className="relative h-16 w-16 overflow-hidden">
                      <Image src={a.image} alt="" fill className="object-cover" />
                    </span>
                    <span>
                      <span className="block font-display text-xl">{a.name}</span>
                      <span className="label-mono">{a.specialty}</span>
                    </span>
                  </button>
                ))}
                <CtaLink href="/quiz" variant="outline" className="sm:col-span-2">
                  Não sei — me ajuda no quiz
                </CtaLink>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-4xl">Descreva a ideia</h2>
              <textarea
                rows={6}
                className="mt-6 w-full p-4"
                placeholder="Motivo, referências, o que não quer..."
                {...form.register("idea")}
              />
              {form.formState.errors.idea && (
                <p className="mt-2 text-sm text-error">{form.formState.errors.idea.message}</p>
              )}
              <p className="mt-4 text-sm text-ink-secondary">
                Sem referência? Abra o{" "}
                <Link href="/quiz" className="text-moss underline">
                  quiz de estilo
                </Link>{" "}
                ou o{" "}
                <Link href="/simular" className="text-moss underline">
                  simulador
                </Link>
                .
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6">
              <h2 className="font-display text-4xl">Onde e em que escala?</h2>
              <input placeholder="Local do corpo" className="w-full p-4" {...form.register("bodyPart")} />
              <select className="w-full p-4" {...form.register("size")}>
                <option value="pequena">Pequena</option>
                <option value="media">Média</option>
                <option value="grande">Grande / projeto</option>
              </select>
              <fieldset className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="sim" {...form.register("firstTattoo")} /> Primeira tattoo
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="nao" {...form.register("firstTattoo")} /> Já tenho
                </label>
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <h2 className="font-display text-4xl">Quem é você</h2>
              <input placeholder="Nome" className="w-full p-4" {...form.register("name")} />
              <input placeholder="E-mail" className="w-full p-4" {...form.register("email")} />
              <input placeholder="Telefone / WhatsApp" className="w-full p-4" {...form.register("phone")} />
              <input placeholder="Instagram (opcional)" className="w-full p-4" {...form.register("instagram")} />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-4xl">Escolha um horário</h2>
              <p className="mt-2 text-sm text-ink-secondary">
                Prévia de disponibilidade. Cal.com entra quando o token estiver no ambiente.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {SLOTS.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => form.setValue("slot", slot, { shouldValidate: true })}
                    className={cn(
                      "border px-4 py-4 text-left",
                      values.slot === slot ? "border-line-accent bg-bg-accent/40" : "border-line",
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="font-display text-4xl">Resumo</h2>
              <ul className="mt-6 space-y-2 text-ink-secondary">
                <li>Artista: {artist?.name ?? values.artist}</li>
                <li>Ideia: {values.idea}</li>
                <li>
                  {values.bodyPart} · {values.size} · primeira: {values.firstTattoo}
                </li>
                <li>
                  {values.name} · {values.email} · {values.phone}
                </li>
                <li>Horário: {values.slot}</li>
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          className="text-sm text-ink-secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Voltar
        </button>
        {step < STEPS.length - 1 ? (
          <MagneticButton onClick={next}>Continuar</MagneticButton>
        ) : (
          <MagneticButton type="submit">Enviar pedido</MagneticButton>
        )}
      </div>
    </form>
  );
}
