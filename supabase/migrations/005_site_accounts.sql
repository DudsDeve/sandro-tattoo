create table if not exists public.site_accounts (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  saved_pins jsonb not null default '[]'::jsonb
);

alter table public.site_accounts add column if not exists saved_pins jsonb not null default '[]'::jsonb;

create index if not exists site_accounts_email_idx on public.site_accounts (email);

alter table public.site_accounts enable row level security;

create index if not exists site_accounts_email_idx on public.site_accounts (email);

alter table public.site_accounts enable row level security;
