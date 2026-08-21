# Supabase — Sandro Tattoo

O admin (Site, categorias, artistas, trabalhos, blog) persiste no **Supabase** quando as variáveis de ambiente estão configuradas.

## Setup rápido

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Abra **SQL Editor** e execute o arquivo:
   [`supabase/migrations/001_cms.sql`](./migrations/001_cms.sql)
3. Em **Settings → API**, copie:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_URL`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`
4. Cole no `.env.local` e na Vercel (Environment Variables)
5. Reinicie o `npm run dev`

## O que é salvo

| Dado | Tabela |
|------|--------|
| CMS completo (categorias, artistas, itens, posts, siteContent) | `cms_store` (JSONB) |
| Estado do cron do blog | `cms_blog_cron` |
| Campos do editor Site (espelho flat) | `site_content` |
| Uploads de imagem/vídeo | Storage bucket `media` |

## Prioridade de persistência

1. **Supabase** (se configurado) — fonte da verdade
2. Vercel Blob (`BLOB_READ_WRITE_TOKEN`)
3. Arquivo local `content/cms.json`

Na primeira leitura com Supabase ligado, dados antigos de Blob/local são migrados automaticamente.

## Segurança

- O app usa a **service role** só no servidor (API routes).
- RLS está ligado nas tabelas; anon não lê/escreve o CMS.
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no client.
