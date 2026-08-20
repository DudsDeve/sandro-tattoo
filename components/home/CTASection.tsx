import { CtaLink } from "@/components/ui/CursorLink";
import { ParallaxImage } from "@/components/ui/ParallaxImage";

export function CTASection() {
  return (
    <section className="relative h-[90svh] min-h-[560px]">
      <ParallaxImage
        src="https://images.unsplash.com/photo-1590246814883-57c511e02123?auto=format&fit=crop&w=2000&q=80"
        alt="Interior do estúdio"
        className="absolute inset-0 h-full"
        speed={0.35}
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
        <h2 className="display-section max-w-4xl">Pronto para marcar sua história?</h2>
        <p className="mt-6 max-w-lg text-ink-secondary">
          Consulta, desenho e sessão — no mesmo lugar. Ou comece pelo quiz se ainda não sabe o artista.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <CtaLink href="/agendar">Agendar Sessão</CtaLink>
          <CtaLink href="/quiz" variant="outline">
            Falar com a gente
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
