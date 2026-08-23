import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPgPool } from "@/lib/supabase/pg";
import { isUnlimitedEmail, remainingUses, TRYON_CONFIG } from "@/lib/tryon-auth/constants";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Pool } from "pg";

export type TryonUser = {
  id: string;
  email: string;
  email_confirmed: boolean;
  confirmation_token: string;
  created_at: string;
};

export type UsageSnapshot = {
  usesThisMonth: number;
  remainingUses: number;
  monthlyLimit: number;
  isUnlimited: boolean;
  canUse: boolean;
};

type Store = { kind: "sb"; sb: SupabaseClient } | { kind: "pg"; pool: Pool };

function store(): Store {
  const sb = getSupabaseAdmin();
  if (sb) return { kind: "sb", sb };
  const pool = getPgPool();
  if (pool) return { kind: "pg", pool };
  throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).");
}

function asUser(row: TryonUser | null | undefined): TryonUser | null {
  return row ?? null;
}

export async function findUserByEmail(email: string): Promise<TryonUser | null> {
  const s = store();
  if (s.kind === "sb") {
    const { data, error } = await s.sb.from("tryon_users").select("*").eq("email", email).maybeSingle();
    if (error) throw new Error(error.message);
    return asUser(data as TryonUser | null);
  }
  const { rows } = await s.pool.query<TryonUser>("select * from tryon_users where email = $1 limit 1", [email]);
  return rows[0] ?? null;
}

export async function findUserByToken(token: string): Promise<TryonUser | null> {
  const s = store();
  if (s.kind === "sb") {
    const { data, error } = await s.sb.from("tryon_users").select("*").eq("confirmation_token", token).maybeSingle();
    if (error) throw new Error(error.message);
    return asUser(data as TryonUser | null);
  }
  const { rows } = await s.pool.query<TryonUser>(
    "select * from tryon_users where confirmation_token = $1 limit 1",
    [token],
  );
  return rows[0] ?? null;
}

export async function insertUser(email: string): Promise<TryonUser> {
  const s = store();
  if (s.kind === "sb") {
    const { data, error } = await s.sb.from("tryon_users").insert({ email }).select("*").single();
    if (error || !data) throw new Error(error?.message || "Failed to register");
    return data as TryonUser;
  }
  const { rows } = await s.pool.query<TryonUser>(
    "insert into tryon_users (email) values ($1) returning *",
    [email],
  );
  if (!rows[0]) throw new Error("Failed to register");
  return rows[0];
}

export async function confirmUser(id: string) {
  const s = store();
  const now = new Date().toISOString();
  if (s.kind === "sb") {
    const { error } = await s.sb
      .from("tryon_users")
      .update({
        email_confirmed: true,
        confirmed_at: now,
        updated_at: now,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await s.pool.query(
    "update tryon_users set email_confirmed = true, confirmed_at = $2, updated_at = $2 where id = $1",
    [id, now],
  );
}

export async function countUsesThisMonth(userId: string) {
  const s = store();
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  if (s.kind === "sb") {
    const { count, error } = await s.sb
      .from("tryon_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", start.toISOString());
    if (error) throw new Error(error.message);
    return count ?? 0;
  }
  const { rows } = await s.pool.query<{ n: string }>(
    "select count(*)::text as n from tryon_usage where user_id = $1 and created_at >= $2",
    [userId, start.toISOString()],
  );
  return Number(rows[0]?.n ?? 0);
}

export async function usageSnapshot(email: string, userId: string): Promise<UsageSnapshot> {
  const uses = await countUsesThisMonth(userId);
  const unlimited = isUnlimitedEmail(email);
  const remaining = remainingUses(email, uses);
  return {
    usesThisMonth: uses,
    remainingUses: remaining,
    monthlyLimit: unlimited ? 999999 : TRYON_CONFIG.MONTHLY_LIMIT,
    isUnlimited: unlimited,
    canUse: remaining > 0,
  };
}

export async function logUsage(userId: string, modelUsed: string, designName: string) {
  const s = store();
  if (s.kind === "sb") {
    const { error } = await s.sb.from("tryon_usage").insert({
      user_id: userId,
      model_used: modelUsed,
      design_name: designName,
    });
    if (error) throw new Error(error.message);
    return;
  }
  await s.pool.query("insert into tryon_usage (user_id, model_used, design_name) values ($1, $2, $3)", [
    userId,
    modelUsed,
    designName,
  ]);
}
