-- Virtual Try-On email gate + monthly usage
-- Run in Supabase SQL Editor or: node scripts/setup-supabase.mjs (after adding this file)

CREATE TABLE IF NOT EXISTS public.tryon_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_confirmed BOOLEAN DEFAULT FALSE,
  confirmation_token UUID DEFAULT gen_random_uuid(),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tryon_users_email ON public.tryon_users(email);
CREATE INDEX IF NOT EXISTS idx_tryon_users_token ON public.tryon_users(confirmation_token);

CREATE TABLE IF NOT EXISTS public.tryon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.tryon_users(id) ON DELETE CASCADE,
  model_used TEXT NOT NULL,
  design_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tryon_usage_user_date ON public.tryon_usage(user_id, created_at);

CREATE OR REPLACE VIEW public.tryon_monthly_usage AS
SELECT
  u.id AS user_id,
  u.email,
  COUNT(t.id) AS uses_this_month,
  CASE
    WHEN u.email = 'teste@teste.com' THEN 999999
    ELSE 3
  END AS monthly_limit,
  CASE
    WHEN u.email = 'teste@teste.com' THEN 999999
    ELSE GREATEST(0, 3 - COUNT(t.id)::INT)
  END AS remaining_uses
FROM public.tryon_users u
LEFT JOIN public.tryon_usage t
  ON t.user_id = u.id
  AND t.created_at >= date_trunc('month', NOW())
  AND t.created_at < date_trunc('month', NOW()) + INTERVAL '1 month'
WHERE u.email_confirmed = TRUE
GROUP BY u.id, u.email;

ALTER TABLE public.tryon_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryon_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access users" ON public.tryon_users;
DROP POLICY IF EXISTS "Service role full access usage" ON public.tryon_usage;

CREATE POLICY "Service role full access users"
  ON public.tryon_users FOR ALL
  TO service_role
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access usage"
  ON public.tryon_usage FOR ALL
  TO service_role
  USING (TRUE) WITH CHECK (TRUE);
