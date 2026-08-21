-- Sandro Tattoo CMS — run once in Supabase SQL Editor
-- Dashboard → SQL → New query → Run

-- Main CMS document (categories, artists, works, posts, siteContent)
create table if not exists public.cms_store (
  id text primary key default 'main',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Blog automation cron state
create table if not exists public.cms_blog_cron (
  id text primary key default 'state',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Optional: flat site editor keys (kept in sync via app; useful for SQL queries)
create table if not exists public.site_content (
  field_id text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists site_content_updated_at_idx on public.site_content (updated_at desc);

-- Seed empty main row
insert into public.cms_store (id, payload)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

insert into public.cms_blog_cron (id, payload)
values ('state', '{}'::jsonb)
on conflict (id) do nothing;

-- Public media bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set public = excluded.public;

-- RLS: server uses service role (bypasses RLS). Lock down anon access.
alter table public.cms_store enable row level security;
alter table public.cms_blog_cron enable row level security;
alter table public.site_content enable row level security;

-- No anon policies = only service role can read/write these tables.
-- (Public site reads go through Next.js API with service role.)

-- Storage: public read for media; write via service role only
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "Service role upload media" on storage.objects;
-- Service role bypasses RLS; this policy is optional for authenticated uploads later.
