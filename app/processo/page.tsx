import type { Metadata } from "next";
import { ProcessScenes } from "@/components/home/ProcessScenes";

export const metadata: Metadata = {
  title: "Processo",
  description: "Da consulta à cicatrização — como uma peça nasce no Sandro Tattoo.",
};

export default function ProcessoPage() {
  return (
    <div className="pt-16">
      <ProcessScenes />
    </div>
  );
}
