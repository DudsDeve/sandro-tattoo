import { getTryonSupabase } from "@/lib/tryon-auth/supabase";
import { isUnlimitedEmail, remainingUses, TRYON_CONFIG } from "@/lib/tryon-auth/constants";

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

export async function findUserByEmail(email: string): Promise<TryonUser | null> {
  const sb = getTryonSupabase();
  const { data, error } = await sb.from("tryon_users").select("*").eq("email", email).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as TryonUser | null) ?? null;
}

export async function findUserByToken(token: string): Promise<TryonUser | null> {
  const sb = getTryonSupabase();
  const { data, error } = await sb.from("tryon_users").select("*").eq("confirmation_token", token).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as TryonUser | null) ?? null;
}

export async function insertUser(email: string): Promise<TryonUser> {
  const sb = getTryonSupabase();
  const { data, error } = await sb.from("tryon_users").insert({ email }).select("*").single();
  if (error || !data) throw new Error(error?.message || "Failed to register");
  return data as TryonUser;
}

export async function confirmUser(id: string) {
  const sb = getTryonSupabase();
  const { error } = await sb
    .from("tryon_users")
    .update({
      email_confirmed: true,
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function countUsesThisMonth(userId: string) {
  const sb = getTryonSupabase();
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const { count, error } = await sb
    .from("tryon_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start.toISOString());
  if (error) throw new Error(error.message);
  return count ?? 0;
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
  const sb = getTryonSupabase();
  const { error } = await sb.from("tryon_usage").insert({
    user_id: userId,
    model_used: modelUsed,
    design_name: designName,
  });
  if (error) throw new Error(error.message);
}
