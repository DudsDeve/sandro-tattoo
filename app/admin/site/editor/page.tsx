import { Suspense } from "react";
import SiteVisualEditorPage from "./SiteVisualEditorClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-[#a09b95]">Carregando editor…</p>}>
      <SiteVisualEditorPage />
    </Suspense>
  );
}
