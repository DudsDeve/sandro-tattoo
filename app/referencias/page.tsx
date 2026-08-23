import type { Metadata } from "next";
import { ReferenceExplorer } from "@/components/references/ReferenceExplorer";
import { ReferencesPageHeader } from "@/components/ui/PageHeaders";

export const metadata: Metadata = {
  title: "Find your reference",
  description: "Search Pinterest tattoo references and save them to book a session at VERSUS.",
};

export const dynamic = "force-dynamic";

export default function ReferencesPage() {
  return (
    <div className="page-shell">
      <ReferencesPageHeader />
      <ReferenceExplorer />
    </div>
  );
}
