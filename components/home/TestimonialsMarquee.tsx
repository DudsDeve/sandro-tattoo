import { testimonials } from "@/lib/data/content";

function Row({ reverse = false }: { reverse?: boolean }) {
  const loop = [...testimonials, ...testimonials];
  return (
    <div className="overflow-hidden">
      <div className={`marquee-track gap-4 ${reverse ? "marquee-reverse" : ""}`}>
        {loop.map((t, i) => (
          <article
            key={`${t.id}-${i}`}
            className="w-[min(90vw,380px)] shrink-0 border border-line bg-bg-tertiary p-6"
          >
            <p className="text-sm text-ink-secondary">“{t.text}”</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="font-display text-xl">{t.name}</p>
              <p className="text-moss">{"★".repeat(t.rating)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function TestimonialsMarquee() {
  return (
    <section className="bg-bg-primary py-24">
      <p className="label-mono mb-3 px-4 md:px-12">Depoimentos</p>
      <h2 className="display-section mb-12 px-4 md:px-12">Pele que volta. E indica.</h2>
      <div className="flex flex-col gap-4">
        <Row />
        <Row reverse />
      </div>
    </section>
  );
}
