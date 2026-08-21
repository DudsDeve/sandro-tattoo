import type {
  Artist,
  BlogPost,
  Product,
  ProcessStep,
  QuizQuestion,
  Specialty,
  TattooWork,
  Testimonial,
} from "@/lib/types";

/** Categorias sem imagem — preencha no admin. */
export const specialties: Specialty[] = [
  {
    slug: "blackwork",
    name: "Blackwork",
    description: "Sólidos, ornamentais e geométricos. Contraste absoluto, composição autoral.",
    image: "",
  },
  {
    slug: "realismo",
    name: "Realismo",
    description: "Retratos, fauna e textura fotográfica em black & grey ou cor.",
    image: "",
  },
  {
    slug: "fine-line",
    name: "Fine Line",
    description: "Traço delicado, joalheria na pele. Floral, script e minimalismo preciso.",
    image: "",
  },
  {
    slug: "old-school",
    name: "Old School",
    description: "Bold lines, paleta clássica, iconografia atemporal.",
    image: "",
  },
  {
    slug: "aquarela",
    name: "Aquarela",
    description: "Manchas, transparência e cor que respira com o corpo.",
    image: "",
  },
  {
    slug: "oriental",
    name: "Oriental",
    description: "Irezumi contemporâneo: fluxo, escala e narrativa em grandes peças.",
    image: "",
  },
];

/** Sem artistas mock — adicione no admin. */
export const artists: Artist[] = [];

/** Sem trabalhos mock — adicione no admin. */
export const gallery: TattooWork[] = [];

/** Sem produtos mock — adicione quando a loja tiver estoque. */
export const products: Product[] = [];

/** Sem posts mock — gere no Blog + IA ou crie no admin. */
export const posts: BlogPost[] = [];

export const testimonials: Testimonial[] = [];

export const processSteps: ProcessStep[] = [
  {
    id: "consulta",
    number: "01",
    title: "Consulta",
    body: "Conversamos sobre intenção, referências, local do corpo e orçamento. Sem compromisso de desenhar na hora.",
    detail: "Presencial ou vídeo. 30–45 minutos. Você sai com um recorte claro: estilo, escala e artista.",
  },
  {
    id: "design",
    number: "02",
    title: "Design",
    body: "O artista constrói a peça para o seu corpo — não um flash genérico. Você aprova antes da agulha.",
    detail: "Estudos, ajustes e, se fizer sentido, o gerador de conceito como ponto de partida visual.",
  },
  {
    id: "preparacao",
    number: "03",
    title: "Preparação",
    body: "Stencil, posicionamento, checagem de pele e combinados da sessão. Respiração antes do primeiro traço.",
    detail: "Durma, coma, hidrate. Chegue sóbrio. Avisamos o que vestir para o local tatuado.",
  },
  {
    id: "sessao",
    number: "04",
    title: "Sessão",
    body: "Música baixa, pausas honestas, técnica sem pressa. A sessão dura o que a pele aguentar bem.",
    detail: "Sessões de 3 a 6 horas. Projetos grandes se quebram em capítulos — nunca em pressa.",
  },
  {
    id: "cuidados",
    number: "05",
    title: "Cuidados",
    body: "Kit, instruções escritas e canal direto nos primeiros dias. Cicatrizar é parte da tatuagem.",
    detail: "Filme, lavagem, hidratação fina. Sem sol, piscina ou academia até liberarmos.",
  },
  {
    id: "cicatrizacao",
    number: "06",
    title: "Cicatrização",
    body: "Retoque se precisar, foto healed, e o convite para a próxima camada do projeto.",
    detail: "Revisão em 4–6 semanas. Peças grandes ganham continuidade — o corpo vira um arquivo vivo.",
  },
];

/** Quiz só com texto — sem imagens mockadas. */
export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Qual linguagem visual te puxa primeiro?",
    hint: "Escolha com o estômago, não com a cabeça.",
    type: "text",
    options: [
      { id: "blackwork", label: "Blackwork", icon: "■", weights: { blackwork: 3, oriental: 1, dotwork: 1 } },
      { id: "realismo", label: "Realismo", icon: "◎", weights: { realismo: 3, aquarela: 1 } },
      { id: "fine-line", label: "Fine Line", icon: "┄", weights: { "fine-line": 3, aquarela: 1, dotwork: 1 } },
      { id: "old-school", label: "Old School", icon: "★", weights: { "old-school": 3, "neo-tradicional": 2 } },
    ],
  },
  {
    id: "q2",
    prompt: "Você prefere…",
    type: "text",
    options: [
      { id: "detalhe", label: "Densidade e detalhe", icon: "▣", weights: { realismo: 2, blackwork: 2, oriental: 1 } },
      { id: "minimo", label: "Essência minimalista", icon: "·", weights: { "fine-line": 3, dotwork: 1 } },
    ],
  },
  {
    id: "q3",
    prompt: "Que tipo de traço te atrai?",
    type: "text",
    options: [
      { id: "bold", label: "Linhas grossas e bold", icon: "—", weights: { "old-school": 3, "neo-tradicional": 2, blackwork: 1 } },
      { id: "fino", label: "Linhas finas e delicadas", icon: "┄", weights: { "fine-line": 3, aquarela: 1 } },
      { id: "sem", label: "Sem linha — só volume", icon: "●", weights: { realismo: 3, aquarela: 1 } },
    ],
  },
  {
    id: "q4",
    prompt: "Qual universo visual te representa?",
    type: "text",
    options: [
      { id: "natureza", label: "Natureza", icon: "✿", weights: { aquarela: 2, "fine-line": 2, realismo: 1 } },
      { id: "geo", label: "Geométrico", icon: "◇", weights: { blackwork: 2, dotwork: 3 } },
      { id: "cultural", label: "Cultural / oriental", icon: "☯", weights: { oriental: 3, blackwork: 1 } },
      { id: "dark", label: "Dark / surreal", icon: "☽", weights: { blackwork: 2, "neo-tradicional": 2, realismo: 1 } },
    ],
  },
  {
    id: "q5",
    prompt: "Que tamanho você imagina?",
    type: "text",
    options: [
      { id: "p", label: "Pequena — pulso, dedo, atrás da orelha", icon: "·", weights: { "fine-line": 2 } },
      { id: "m", label: "Média — antebraço, panturrilha, ombro", icon: "○", weights: { "neo-tradicional": 1, aquarela: 1, realismo: 1 } },
      { id: "g", label: "Grande — sleeve, costas, peito", icon: "◉", weights: { blackwork: 2, oriental: 2, realismo: 2 } },
    ],
  },
  {
    id: "q6",
    prompt: "Colorido ou preto e cinza?",
    type: "text",
    options: [
      { id: "pb", label: "Preto e cinza", icon: "◼", weights: { blackwork: 2, realismo: 2, "fine-line": 1, dotwork: 1 } },
      { id: "cor", label: "Colorido", icon: "▣", weights: { aquarela: 3, "old-school": 2, "neo-tradicional": 2 } },
    ],
  },
  {
    id: "q7",
    prompt: "O que a tatuagem deve transmitir?",
    type: "text",
    options: [
      { id: "forca", label: "Força", icon: "▲", weights: { blackwork: 2, oriental: 1, realismo: 1 } },
      { id: "delicadeza", label: "Delicadeza", icon: "✿", weights: { "fine-line": 3, aquarela: 2 } },
      { id: "misterio", label: "Mistério", icon: "☽", weights: { blackwork: 2, dotwork: 2, realismo: 1 } },
      { id: "liberdade", label: "Liberdade", icon: "✧", weights: { aquarela: 2, "old-school": 1, "neo-tradicional": 1 } },
    ],
  },
];

export const flashDesigns: { id: string; name: string; image: string; artist: string }[] = [];
