import type { Metadata } from "next";
import { TattooSimulator } from "@/components/simulator/TattooSimulator";

export const metadata: Metadata = {
  title: "Simular tattoo",
  description: "Faça upload da sua pele e posicione um design do estúdio para prévia.",
};

export default function SimularPage() {
  return (
    <div className="px-4 pb-28 pt-28 sm:px-5 md:px-12 md:pt-32">
      <p className="label-mono">Simulador</p>
      <h1 className="display-section mt-4 mb-4">A peça sobre a sua pele.</h1>
      <p className="mb-12 max-w-xl text-ink-secondary">
        Preview aproximado com blend multiply — não substitui a consulta. Arraste, gire e ajuste opacidade.
      </p>
      <TattooSimulator />
    </div>
  );
}
