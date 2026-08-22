import { Pool } from "pg";

let pool: Pool | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL);
}

export function getPgPool() {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url.replace("sslmode=require", "sslmode=no-verify"),
      ssl: { rejectUnauthorized: false },
      max: 4,
    });
  }
  return pool;
}
