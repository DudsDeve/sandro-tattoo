import { readFileSync } from "fs";
import path from "path";
import { Client } from "pg";

function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  const raw = readFileSync(file, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadEnvLocal();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL ausente no .env.local");
    process.exit(1);
  }

  const sql001 = readFileSync(path.join(process.cwd(), "supabase/migrations/001_cms.sql"), "utf8");
  const sql002 = readFileSync(path.join(process.cwd(), "supabase/migrations/002_auth_storage.sql"), "utf8");

  const client = new Client({
    connectionString: url.replace("sslmode=require", "sslmode=no-verify"),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  console.log("Conectado. Aplicando 001_cms.sql…");
  await client.query(sql001);
  console.log("Aplicando 002_auth_storage.sql…");
  try {
    await client.query(sql002);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("execute function")) {
      const alt = sql002.replace("execute function public.handle_new_user()", "execute procedure public.handle_new_user()");
      await client.query(alt);
    } else {
      throw e;
    }
  }

  const email = process.env.ADMIN_EMAIL || "admin@versus.studio";
  const password = process.env.ADMIN_PASSWORD || "sandroadmin";

  const { rows: existing } = await client.query("select id from auth.users where email = $1", [email]);
  if (existing.length) {
    console.log("Usuário admin já existe:", email);
  } else {
    const { rows } = await client.query(
      `insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        $1::text,
        crypt($2::text, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"role":"admin","display_name":"VERSUS Admin"}'::jsonb,
        now(), now(),
        '', '', '', ''
      )
      returning id`,
      [email, password],
    );
    const userId = rows[0].id;
    await client.query(
      `insert into auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at, email
      ) values (
        gen_random_uuid(),
        $1::uuid,
        jsonb_build_object('sub', $1::text, 'email', $2::text),
        'email',
        $1::text,
        now(), now(), now(),
        $2::text
      )`,
      [userId, email],
    );
    await client.query(
      `insert into public.profiles (id, email, role, display_name)
       values ($1, $2, 'admin', 'VERSUS Admin')
       on conflict (id) do update set role = 'admin'`,
      [userId, email],
    );
    console.log("Usuário Auth criado:", email);
  }

  const { rows: buckets } = await client.query("select id, public from storage.buckets order by id");
  console.log("Buckets:", buckets.map((b) => `${b.id}(public=${b.public})`).join(", "));

  const { rows: tables } = await client.query(
    `select tablename from pg_tables where schemaname = 'public' and tablename in ('cms_store','cms_blog_cron','site_content','profiles') order by 1`,
  );
  console.log("Tabelas:", tables.map((t) => t.tablename).join(", "));

  await client.end();
  console.log("Setup Supabase concluído.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
