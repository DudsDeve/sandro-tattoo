import type { Metadata } from "next";
import { VirtualTryoutClient } from "@/app/virtual-tryout/VirtualTryoutClient";

export const metadata: Metadata = {
  title: "Virtual try-on",
  description: "Upload a body photo, mark the area, and preview a healed tattoo with AI.",
};

export default function VirtualTryoutRoute() {
  return <VirtualTryoutClient />;
}
