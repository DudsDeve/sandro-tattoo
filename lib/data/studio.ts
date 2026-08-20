export const STUDIO = {
  name: "Sandro Tattoo",
  shortName: "Sandro",
  tagline: "Arte gravada na pele",
  description:
    "Estúdio de tatuagem autoral em Dublin. Realismo, blackwork, fine line e peças únicas — do conceito à cicatrização.",
  years: 14,
  phone: "+55 11 98888-0000",
  whatsapp: "5511988880000",
  email: "studio@sandrotattoo.com",
  instagram: "sandrotattoo",
  address: {
    street: "Região central",
    neighborhood: "North City",
    city: "Dublin",
    state: "D",
    stateName: "Dublin",
    country: "Irlanda",
    zip: "D01",
    full: "Dublin, Irlanda",
    mapsUrl: "https://www.google.com/maps/@53.3510701,-6.2700491,14z",
    geo: {
      lat: 53.3510701,
      lng: -6.2700491,
    },
  },
  hours: [
    { days: "Segunda — Sexta", time: "11h — 20h" },
    { days: "Sábado", time: "10h — 18h" },
    { days: "Domingo", time: "Fechado" },
  ],
  walkIn: "Walk-in limitado de terça a sábado, sujeito à disponibilidade.",
  deposit: "R$ 200 para reservar horário (abatido no valor da sessão).",
  minPrice: "R$ 450",
} as const;

export const NAV_LINKS = [
  { href: "/artistas", label: "Artistas" },
  { href: "/galeria", label: "Galeria" },
  { href: "/processo", label: "Processo" },
  { href: "/loja", label: "Loja" },
  { href: "/blog", label: "Blog" },
] as const;
