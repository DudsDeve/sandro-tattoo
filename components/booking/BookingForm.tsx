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
import { useT } from "@/lib/i18n/LanguageProvider";

type Form = {
  artist: string;
  idea: string;
  bodyPart: string;
  size: string;
  firstTattoo: "sim" | "nao";
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  slot: string;
};

export function BookingForm() {
  const t = useT();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        artist: z.string().min(1, t.booking.errArtist),
        idea: z.string().min(12, t.booking.errIdea),
        bodyPart: z.string().min(2),
        size: z.string().min(1),
        firstTattoo: z.enum(["sim", "nao"]),
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(8),
        instagram: z.string().optional(),
        slot: z.string().min(1, t.booking.errSlot),
      }),
    [t],
  );

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
  const steps = t.booking.steps;
  const slots = t.booking.slots;

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
    if (ok) setStep((s) => Math.min(s + 1, steps.length - 1));
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
        <p className="label-mono">{t.booking.doneLabel}</p>
        <h2 className="display-section mt-4">{t.booking.doneTitle}</h2>
        <p className="mx-auto mt-4 max-w-md text-ink-secondary">{t.booking.doneBody}</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <CtaLink href="/simular">{t.booking.simulate}</CtaLink>
          <CtaLink href="/" variant="outline">
            {t.booking.goHome}
          </CtaLink>
        </div>
      </div>
    );
  }

  const ideaHint = t.booking.ideaHint
    .replace("{quiz}", "___QUIZ___")
    .replace("{sim}", "___SIM___")
    .split(/(___QUIZ___|___SIM___)/);

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl">
      <div className="mb-8 md:mb-12">
        <p className="label-mono mb-3 md:hidden">
          {step + 1}/{steps.length} · {steps[step]}
        </p>
        <div className="flex gap-2">
          {steps.map((label, i) => (
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
              <h2 className="font-display text-3xl sm:text-4xl">{t.booking.pickArtist}</h2>
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
                  {t.booking.helpQuiz}
                </CtaLink>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">{t.booking.describeIdea}</h2>
              <textarea
                rows={6}
                className="mt-6 w-full p-4"
                placeholder={t.booking.ideaPlaceholder}
                {...form.register("idea")}
              />
              {form.formState.errors.idea && (
                <p className="mt-2 text-sm text-error">{form.formState.errors.idea.message}</p>
              )}
              <p className="mt-4 text-sm text-ink-secondary">
                {ideaHint.map((part, i) => {
                  if (part === "___QUIZ___") {
                    return (
                      <Link key={i} href="/quiz" className="text-moss underline">
                        {t.booking.ideaHintQuiz}
                      </Link>
                    );
                  }
                  if (part === "___SIM___") {
                    return (
                      <Link key={i} href="/simular" className="text-moss underline">
                        {t.booking.ideaHintSim}
                      </Link>
                    );
                  }
                  return <span key={i}>{part}</span>;
                })}
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6">
              <h2 className="font-display text-3xl sm:text-4xl">{t.booking.whereScale}</h2>
              <input placeholder={t.booking.bodyPart} className="w-full p-4" {...form.register("bodyPart")} />
              <select className="w-full p-4" {...form.register("size")}>
                <option value="pequena">{t.booking.sizeSmall}</option>
                <option value="media">{t.booking.sizeMedium}</option>
                <option value="grande">{t.booking.sizeLarge}</option>
              </select>
              <fieldset className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="sim" {...form.register("firstTattoo")} /> {t.booking.firstYes}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="nao" {...form.register("firstTattoo")} /> {t.booking.firstNo}
                </label>
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <h2 className="font-display text-3xl sm:text-4xl">{t.booking.whoAreYou}</h2>
              <input placeholder={t.booking.name} className="w-full p-4" {...form.register("name")} />
              <input placeholder={t.booking.email} className="w-full p-4" {...form.register("email")} />
              <input placeholder={t.booking.phone} className="w-full p-4" {...form.register("phone")} />
              <input placeholder={t.booking.instagram} className="w-full p-4" {...form.register("instagram")} />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">{t.booking.pickSlot}</h2>
              <p className="mt-2 text-sm text-ink-secondary">{t.booking.slotHint}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {slots.map((slot) => (
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
              <h2 className="font-display text-3xl sm:text-4xl">{t.booking.summary}</h2>
              <ul className="mt-6 space-y-2 text-ink-secondary">
                <li>
                  {t.booking.summaryArtist}: {artist?.name ?? values.artist}
                </li>
                <li>
                  {t.booking.summaryIdea}: {values.idea}
                </li>
                <li>
                  {values.bodyPart} · {values.size} · {t.booking.summaryFirst}: {values.firstTattoo}
                </li>
                <li>
                  {values.name} · {values.email} · {values.phone}
                </li>
                <li>
                  {t.booking.summarySlot}: {values.slot}
                </li>
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          className="text-sm text-ink-secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          {t.booking.back}
        </button>
        {step < steps.length - 1 ? (
          <MagneticButton onClick={next}>{t.booking.continue}</MagneticButton>
        ) : (
          <MagneticButton type="submit">{t.booking.submit}</MagneticButton>
        )}
      </div>
    </form>
  );
}
