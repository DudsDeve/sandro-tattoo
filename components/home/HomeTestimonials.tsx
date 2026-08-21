"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const ITEMS = [
  {
    id: "t1",
    name: "Marina F.",
    rating: 5,
    pt: "O Sandro transformou uma foto antiga da minha avó em algo que eu choro toda vez que olho. Cuidado absurdo com luz e pele.",
    en: "Sandro turned an old photo of my grandmother into something that still makes me cry. Absurd care with light and skin.",
  },
  {
    id: "t2",
    name: "Rafael M.",
    rating: 5,
    pt: "Fiz um sleeve com o Kai em três sessões. O estúdio é silencioso, limpo, e o processo foi explicado do início ao fim.",
    en: "I did a sleeve with Kai over three sessions. The studio is quiet, clean, and the process was clear from start to finish.",
  },
  {
    id: "t3",
    name: "Helena S.",
    rating: 5,
    pt: "A Luna desenhou um ramo que parece feito à mão livre. Delicado sem ser frágil — exatamente o que eu queria.",
    en: "Luna drew a branch that looks freehand. Delicate without being fragile — exactly what I wanted.",
  },
  {
    id: "t4",
    name: "Bruno T.",
    rating: 5,
    pt: "Primeira tattoo. Eles me seguraram no quiz, no chat e na consulta. Cheguei nervoso, saí viciado.",
    en: "First tattoo. They guided me through the quiz, the chat and the consultation. I arrived nervous and left hooked.",
  },
  {
    id: "t5",
    name: "Camila R.",
    rating: 5,
    pt: "A Vera tem mão de shop clássico com olhar de agora. Cores que vão durar décadas.",
    en: "Vera has classic shop hands with a modern eye. Colours that will last for decades.",
  },
  {
    id: "t6",
    name: "Igor P.",
    rating: 5,
    pt: "Usei o gerador de conceito, levei a referência e o Diego elevou tudo. Não é gimmick — realmente ajuda a conversa.",
    en: "I used the concept generator, brought the reference and Diego elevated everything. Not a gimmick — it really helps the conversation.",
  },
] as const;

function Row({ locale, reverse = false }: { locale: string; reverse?: boolean }) {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden">
      <div className={reverse ? "marquee-track gap-4 marquee-reverse" : "marquee-track gap-4"}>
        {loop.map((item, i) => (
          <article
            key={`${item.id}-${i}`}
            className="w-[min(90vw,380px)] shrink-0 border border-line bg-bg-tertiary p-6"
          >
            <p className="text-sm text-ink-secondary">
              &ldquo;{locale === "pt" ? item.pt : item.en}&rdquo;
            </p>
            <div className="mt-4 flex items-center justify-between">
              <p className="font-display text-xl">{item.name}</p>
              <p className="text-moss">{"★".repeat(item.rating)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/** Depoimentos da home — módulo autônomo para evitar chunk webpack quebrado. */
export function HomeTestimonials() {
  const { locale, t } = useLanguage();

  return (
    <section className="bg-bg-primary py-24">
      <p className="label-mono mb-3 px-4 md:px-12">{t.testimonials.label}</p>
      <h2 className="display-section mb-12 px-4 md:px-12">{t.testimonials.title}</h2>
      <div className="flex flex-col gap-4">
        <Row locale={locale} />
        <Row locale={locale} reverse />
      </div>
    </section>
  );
}
