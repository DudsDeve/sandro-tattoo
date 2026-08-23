"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMemo, useState, useEffect, useRef } from "react";
import { getTryoutFromSession } from "@/lib/tryout/session-storage";
import { buildQuizIdeaText, getQuizFromSession, type QuizSession } from "@/lib/quiz/session-storage";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ImagePlus, Link2 } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CtaLink } from "@/components/ui/CursorLink";
import { MediaImage } from "@/components/ui/MediaImage";
import { cn } from "@/lib/utils";
import { useT, useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Artist } from "@/lib/types";

type Form = {
  artist: string;
  idea: string;
  ideaLink: string;
  ideaImages: string[];
  bodyPart: string;
  size: string;
  firstTattoo: "sim" | "nao";
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  slot: string;
};

export function BookingForm({ artists = [] }: { artists?: Artist[] }) {
  const t = useT();
  const { locale } = useLanguage();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        artist: z.string().min(1, t.booking.errArtist),
        idea: z.string(),
        ideaLink: z
          .string()
          .trim()
          .refine((s) => !s || /^https?:\/\/.+/i.test(s), t.booking.errLink),
        ideaImages: z.array(z.string()).max(5),
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
      ideaLink: "",
      ideaImages: [],
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
  const [tryoutPreview, setTryoutPreview] = useState("");
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [tryoutMeta, setTryoutMeta] = useState<{ designName: string; designStyle: string; modelUsed: string } | null>(
    null,
  );
  const [uploadingRefs, setUploadingRefs] = useState(false);
  const [showLinkField, setShowLinkField] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const refsInput = useRef<HTMLInputElement>(null);

  async function addReferenceFiles(files: FileList | null) {
    if (!files?.length) return;
    const current = form.getValues("ideaImages") || [];
    const room = 5 - current.length;
    if (room <= 0) return;
    setUploadingRefs(true);
    setUploadError("");
    const next = [...current];
    try {
      for (const file of Array.from(files).slice(0, room)) {
        if (!file.type.startsWith("image/")) continue;
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/booking/upload", { method: "POST", body: fd });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
        next.push(data.url);
      }
      form.setValue("ideaImages", next, { shouldDirty: true });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingRefs(false);
      if (refsInput.current) refsInput.current.value = "";
    }
  }

  function removeReference(url: string) {
    form.setValue(
      "ideaImages",
      (form.getValues("ideaImages") || []).filter((u) => u !== url),
      { shouldDirty: true },
    );
  }

  useEffect(() => {
    const quiz = getQuizFromSession();
    const tryout = getTryoutFromSession();
    const fromArtist = params.get("artista");
    if (fromArtist) form.setValue("artist", fromArtist);

    if (quiz?.answers?.length) {
      setQuizSession(quiz);
      if (quiz.artistSlug) form.setValue("artist", fromArtist || quiz.artistSlug);
      setStep(1);
    }
    if (tryout) {
      if (tryout.designArtistSlug && !fromArtist && !quiz?.artistSlug) {
        form.setValue("artist", tryout.designArtistSlug);
      }
      setTryoutPreview(tryout.previewImageUrl);
      setTryoutMeta({
        designName: tryout.designName,
        designStyle: tryout.designStyle,
        modelUsed: tryout.modelUsed,
      });
    }
  }, [form, locale, params]);

  const values = form.watch();
  const artist = useMemo(() => artists.find((a) => a.slug === values.artist), [artists, values.artist]);
  const steps = t.booking.steps;
  const slots = t.booking.slots;

  const next = async () => {
    const fields: Array<keyof Form>[] = [
      ["artist"],
      ["idea", "ideaLink"],
      ["bodyPart", "size", "firstTattoo"],
      ["name", "email", "phone"],
      ["slot"],
      [],
    ];
    const ok = await form.trigger(fields[step]);
    if (step === 1) {
      const notes = form.getValues("idea").trim();
      if (notes.length < 12 && !tryoutPreview && !quizSession) {
        form.setError("idea", { type: "min", message: t.booking.errIdea });
        return;
      }
    }
    if (ok) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const submit = form.handleSubmit(async (data) => {
    const notes = data.idea.trim();
    const parts = [notes];
    if (quizSession?.answers?.length) {
      parts.push(buildQuizIdeaText(quizSession, locale));
    }
    if (tryoutMeta) {
      parts.push(
        locale === "en"
          ? `Virtual Try-On: ${tryoutMeta.designName} (${tryoutMeta.designStyle}). AI model: ${tryoutMeta.modelUsed}. Preview attached.`
          : `Virtual Try-On: ${tryoutMeta.designName} (${tryoutMeta.designStyle}). Modelo IA: ${tryoutMeta.modelUsed}. Preview anexada.`,
      );
    }
    const idea = parts.filter(Boolean).join("\n\n") || notes || "Referência anexada.";
    await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, idea, tryoutPreview }),
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
          <CtaLink href="/virtual-tryout">{t.booking.simulate}</CtaLink>
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
    <form onSubmit={submit} className="mx-auto w-full min-w-0 max-w-3xl">
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
                      <MediaImage src={a.image} alt="" fill className="object-cover" />
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
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <h2 className="font-display text-3xl sm:text-4xl">{t.booking.describeIdea}</h2>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    disabled={uploadingRefs || (values.ideaImages || []).length >= 5}
                    onClick={() => refsInput.current?.click()}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-line px-3 py-2 text-sm text-ink-secondary hover:border-line-accent hover:text-ink disabled:opacity-40 sm:w-auto"
                  >
                    <ImagePlus size={16} />
                    {t.booking.attachImage}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLinkField(true);
                      requestAnimationFrame(() => document.getElementById("booking-idea-link")?.focus());
                    }}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-line px-3 py-2 text-sm text-ink-secondary hover:border-line-accent hover:text-ink sm:w-auto"
                  >
                    <Link2 size={16} />
                    {t.booking.attachLink}
                  </button>
                </div>
              </div>
              <input
                ref={refsInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void addReferenceFiles(e.target.files)}
              />
              {tryoutPreview && (
                <div className="mt-4 flex items-center gap-4 border border-line-accent bg-bg-secondary p-3">
                  <img src={tryoutPreview} alt="" className="h-20 w-16 object-cover" />
                  <div>
                    <p className="label-mono text-[10px] text-moss">{t.booking.attachedTryout}</p>
                    {tryoutMeta ? (
                      <p className="mt-1 text-sm text-ink-secondary">
                        {tryoutMeta.designName} · {tryoutMeta.designStyle}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
              {quizSession?.answers?.length ? (
                <div className="mt-4 border border-line bg-bg-secondary p-3">
                  <p className="label-mono text-[10px] text-moss">{t.booking.attachedQuiz}</p>
                </div>
              ) : null}
              <textarea
                rows={8}
                className="mt-6 w-full p-4 font-medium"
                placeholder={t.booking.ideaPlaceholder}
                {...form.register("idea")}
              />
              {form.formState.errors.idea && (
                <p className="mt-2 text-sm text-error">{form.formState.errors.idea.message}</p>
              )}

              {(values.ideaImages || []).length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {(values.ideaImages || []).map((url) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-md border border-line">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-1 top-1 bg-black/70 px-1.5 text-xs text-white"
                        onClick={() => removeReference(url)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {uploadError && <p className="mt-2 text-sm text-error">{uploadError}</p>}
              {uploadingRefs && <p className="mt-2 text-xs text-ink-muted">…</p>}

              {(showLinkField || values.ideaLink) && (
                <label className="mt-4 block">
                  <span className="label-mono">{t.booking.ideaLink}</span>
                  <input
                    id="booking-idea-link"
                    className="mt-2 w-full p-4"
                    placeholder={t.booking.ideaLinkPlaceholder}
                    {...form.register("ideaLink")}
                  />
                </label>
              )}
              {form.formState.errors.ideaLink && (
                <p className="mt-2 text-sm text-error">{form.formState.errors.ideaLink.message}</p>
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
                      <Link key={i} href="/virtual-tryout" className="text-moss underline">
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
                {values.ideaLink ? (
                  <li>
                    {t.booking.summaryLink}: {values.ideaLink}
                  </li>
                ) : null}
                {(values.ideaImages || []).length ? (
                  <li>
                    <p className="mb-2">{t.booking.summaryRefs}</p>
                    <div className="flex flex-wrap gap-2">
                      {values.ideaImages.map((url) => (
                        <img key={url} src={url} alt="" className="h-16 w-16 rounded-md object-cover" />
                      ))}
                    </div>
                  </li>
                ) : null}
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
