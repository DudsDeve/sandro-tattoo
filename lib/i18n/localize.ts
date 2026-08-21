import type { Locale } from "@/lib/i18n/config";
import type { QuizQuestion, Specialty } from "@/lib/types";

const specialtyEn: Record<string, { name: string; description: string }> = {
  blackwork: {
    name: "Blackwork",
    description: "Solids, ornamental and geometric. Absolute contrast, authorial composition.",
  },
  realismo: {
    name: "Realism",
    description: "Portraits, fauna and photographic texture in black & grey or color.",
  },
  "fine-line": {
    name: "Fine Line",
    description: "Delicate linework, jewelry on skin. Floral, script and precise minimalism.",
  },
  "old-school": {
    name: "Old School",
    description: "Bold lines, classic palette, timeless iconography.",
  },
  aquarela: {
    name: "Watercolor",
    description: "Washes, transparency and color that breathes with the body.",
  },
  oriental: {
    name: "Oriental",
    description: "Contemporary irezumi: flow, scale and narrative in large pieces.",
  },
};

export function localizeSpecialty(locale: Locale, s: Specialty): Specialty {
  if (locale === "pt") return s;
  const hit = specialtyEn[s.slug];
  if (!hit) return s;
  return { ...s, name: hit.name, description: hit.description };
}

export function localizeSpecialties(locale: Locale, list: Specialty[]) {
  return list.map((s) => localizeSpecialty(locale, s));
}

const quizEn: Record<
  string,
  { prompt: string; hint?: string; options: Record<string, string> }
> = {
  q1: {
    prompt: "Which visual language pulls you first?",
    hint: "Choose with your gut, not your head.",
    options: {
      blackwork: "Blackwork",
      realismo: "Realism",
      "fine-line": "Fine Line",
      "old-school": "Old School",
    },
  },
  q2: {
    prompt: "You prefer…",
    options: {
      detalhe: "Density and detail",
      minimo: "Minimal essence",
    },
  },
  q3: {
    prompt: "What kind of line draws you in?",
    options: {
      bold: "Thick, bold lines",
      fino: "Fine, delicate lines",
      sem: "No line — just volume",
    },
  },
  q4: {
    prompt: "Which visual universe feels like you?",
    options: {
      natureza: "Nature",
      geo: "Geometric",
      cultural: "Cultural / oriental",
      dark: "Dark / surreal",
    },
  },
  q5: {
    prompt: "What size do you imagine?",
    options: {
      p: "Small — wrist, finger, behind the ear",
      m: "Medium — forearm, calf, shoulder",
      g: "Large — sleeve, back, chest",
    },
  },
  q6: {
    prompt: "Colour or black & grey?",
    options: {
      pb: "Black & grey",
      cor: "Colour",
    },
  },
  q7: {
    prompt: "Which of these pieces gives you chills?",
    hint: "No spoiler on who made it.",
    options: {
      a: "Piece A",
      b: "Piece B",
      c: "Piece C",
      d: "Piece D",
    },
  },
  q8: {
    prompt: "What should the tattoo convey?",
    options: {
      forca: "Strength",
      delicadeza: "Delicacy",
      misterio: "Mystery",
      liberdade: "Freedom",
    },
  },
};

export function localizeQuizQuestion(locale: Locale, q: QuizQuestion): QuizQuestion {
  if (locale === "pt") return q;
  const hit = quizEn[q.id];
  if (!hit) return q;
  return {
    ...q,
    prompt: hit.prompt,
    hint: hit.hint ?? q.hint,
    options: q.options.map((opt) => ({
      ...opt,
      label: hit.options[opt.id] ?? opt.label,
    })),
  };
}

const testimonialEn: Record<string, string> = {
  t1: "Sandro turned an old photo of my grandmother into something that still makes me cry. Absurd care with light and skin.",
  t2: "I did a sleeve with Kai over three sessions. The studio is quiet, clean, and the process was clear from start to finish.",
  t3: "Luna drew a branch that looks freehand. Delicate without being fragile — exactly what I wanted.",
  t4: "First tattoo. They guided me through the quiz, the chat and the consultation. I arrived nervous and left hooked.",
  t5: "Vera has classic shop hands with a modern eye. Colours that will last for decades.",
  t6: "I used the concept generator, brought the reference and Diego elevated everything. Not a gimmick — it really helps the conversation.",
};

export function localizeTestimonial(locale: Locale, item: { id: string; text: string }) {
  if (locale === "pt") return item.text;
  return testimonialEn[item.id] ?? item.text;
}
