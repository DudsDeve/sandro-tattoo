# Sandro Tattoo

Website cinematográfico para estúdio de tatuagem — Next.js 15, GSAP, Framer Motion, Sanity, Claude e simulador na pele.

## Stack

- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS 4 + design tokens em CSS variables
- GSAP ScrollTrigger, Framer Motion, SplitType, Lenis
- Sanity Studio em `/studio`
- Claude (Vercel AI SDK) para conceito, FAQ RAG e quiz
- Konva para o simulador

## Começar

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variáveis

Copie `.env.example`. Sem `ANTHROPIC_API_KEY` o chat e o assistente usam respostas locais de demonstração. Com a chave, o streaming vai para o Claude.

Sanity: preencha `NEXT_PUBLIC_SANITY_PROJECT_ID` e acesse `/studio`. Sem projeto, o site usa o conteúdo em `lib/data`.

## Rotas

| Rota | Função |
| --- | --- |
| `/` | Home imersiva |
| `/artistas` | Grid de artistas |
| `/galeria` | Portfólio com filtros e lightbox |
| `/processo` | Scrollytelling |
| `/loja` | Merch |
| `/blog` | Editorial |
| `/agendar` | Funil multi-step |
| `/quiz` | Match de artista |
| `/simular` | Preview na pele |
| `/studio` | CMS |

## Deploy

Vercel. Edge nas rotas `/api/chat` e `/api/assistant` quando as keys estiverem no projeto.
