import type { Metadata } from "next";
import { TattooSimulator } from "@/components/simulator/TattooSimulator";
import { SimPageHeader } from "@/components/ui/PageHeaders";

export const metadata: Metadata = {
  title: "Simulate tattoo",
  description: "Upload your skin and place a studio design for a preview.",
};

export default function SimularPage() {
  return (
    <div className="px-4 pb-28 pt-28 sm:px-5 md:px-12 md:pt-32">
      <SimPageHeader />
      <TattooSimulator />
    </div>
  );
}
