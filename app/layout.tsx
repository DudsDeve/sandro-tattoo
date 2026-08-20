import type { Metadata, Viewport } from "next";
import { Caveat, DM_Sans, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { SiteProviders } from "@/components/layout/SiteProviders";
import { STUDIO } from "@/lib/data/studio";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://sandrotattoo.com"),
  title: {
    default: `${STUDIO.name} — ${STUDIO.tagline}`,
    template: `%s — ${STUDIO.name}`,
  },
  description: STUDIO.description,
  openGraph: {
    title: STUDIO.name,
    description: STUDIO.description,
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable} ${caveat.variable}`}>
      <body className="bg-bg-primary text-ink antialiased">
        <SiteProviders>
          <AppShell>{children}</AppShell>
        </SiteProviders>
      </body>
    </html>
  );
}
