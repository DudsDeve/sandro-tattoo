import { promises as fs } from "fs";
import path from "path";
import { getPgPool } from "@/lib/supabase/pg";
import type { SavedPin, SiteUser, SiteUserRecord } from "@/lib/auth/types";

const LOCAL_PATH = path.join(process.cwd(), "content", "accounts.json");

function newId() {
  return `usr_${Math.random().toString(36).slice(2, 12)}`;
}

export function publicUser(row: SiteUserRecord): SiteUser {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.createdAt };
}

async function ensureTable() {
  const pool = getPgPool();
  if (!pool) return;
  await pool.query(`
    create table if not exists public.site_accounts (
      id text primary key,
      name text not null,
      email text not null unique,
      password_hash text not null,
      created_at timestamptz not null default now(),
      saved_pins jsonb not null default '[]'::jsonb
    );
    alter table public.site_accounts add column if not exists saved_pins jsonb not null default '[]'::jsonb;

  `);
}

async function readLocal(): Promise<SiteUserRecord[]> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    const data = JSON.parse(raw) as { users?: SiteUserRecord[] };
    return Array.isArray(data.users)
      ? data.users.map((u) => ({ ...u, savedPins: Array.isArray(u.savedPins) ? u.savedPins : [] }))
      : [];
  } catch {
    return [];
  }
}

async function writeLocal(users: SiteUserRecord[]) {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify({ users }, null, 2), "utf8");
}

function parsePins(raw: unknown): SavedPin[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((p): p is SavedPin => Boolean(p && typeof p === "object" && "imageUrl" in p && "id" in p));
}

function rowFromPg(r: {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date | string;
  saved_pins?: unknown;
}): SiteUserRecord {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.password_hash,
    createdAt: typeof r.created_at === "string" ? r.created_at : r.created_at.toISOString(),
    savedPins: parsePins(r.saved_pins),
  };
}

export async function findUserByEmail(email: string): Promise<SiteUserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const pool = getPgPool();
  if (pool) {
    await ensureTable();
    const { rows } = await pool.query(
      "select id, name, email, password_hash, created_at, coalesce(saved_pins, '[]'::jsonb) as saved_pins from public.site_accounts where email = $1 limit 1",
      [normalized],
    );
    return rows[0] ? rowFromPg(rows[0]) : null;
  }
  const users = await readLocal();
  return users.find((u) => u.email === normalized) ?? null;
}

export async function findUserById(id: string): Promise<SiteUserRecord | null> {
  const pool = getPgPool();
  if (pool) {
    await ensureTable();
    const { rows } = await pool.query(
      "select id, name, email, password_hash, created_at, coalesce(saved_pins, '[]'::jsonb) as saved_pins from public.site_accounts where id = $1 limit 1",
      [id],
    );
    return rows[0] ? rowFromPg(rows[0]) : null;
  }
  const users = await readLocal();
  return users.find((u) => u.id === id) ?? null;
}

export async function createUser(input: { name: string; email: string; passwordHash: string }): Promise<SiteUserRecord> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("EMAIL_TAKEN");
  const row: SiteUserRecord = {
    id: newId(),
    name,
    email,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
    savedPins: [],
  };
  const pool = getPgPool();
  if (pool) {
    await ensureTable();
    await pool.query(
      "insert into public.site_accounts (id, name, email, password_hash, created_at) values ($1, $2, $3, $4, $5)",
      [row.id, row.name, row.email, row.passwordHash, row.createdAt],
    );
    return row;
  }
  const users = await readLocal();
  users.push(row);
  await writeLocal(users);
  return row;
}

export async function listUsers(): Promise<SiteUser[]> {
  const pool = getPgPool();
  if (pool) {
    await ensureTable();
    const { rows } = await pool.query(
      "select id, name, email, created_at from public.site_accounts order by created_at desc",
    );
    return rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      email: r.email as string,
      createdAt: (r.created_at as Date).toISOString?.() || String(r.created_at),
    }));
  }
  const users = await readLocal();
  return users.map(publicUser).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function writePins(userId: string, pins: SavedPin[]) {
  const pool = getPgPool();
  if (pool) {
    await ensureTable();
    await pool.query("update public.site_accounts set saved_pins = $2::jsonb where id = $1", [
      userId,
      JSON.stringify(pins),
    ]);
    return;
  }
  const users = await readLocal();
  const i = users.findIndex((u) => u.id === userId);
  if (i < 0) throw new Error("NOT_FOUND");
  users[i] = { ...users[i], savedPins: pins };
  await writeLocal(users);
}

export async function listUserPins(userId: string): Promise<SavedPin[]> {
  const user = await findUserById(userId);
  return user?.savedPins ?? [];
}

export async function saveUserPin(userId: string, pin: Omit<SavedPin, "savedAt">): Promise<SavedPin[]> {
  const user = await findUserById(userId);
  if (!user) throw new Error("NOT_FOUND");
  const next = [
    { ...pin, savedAt: new Date().toISOString() },
    ...user.savedPins.filter((p) => p.id !== pin.id && p.imageUrl !== pin.imageUrl),
  ].slice(0, 40);
  await writePins(userId, next);
  return next;
}

export async function removeUserPin(userId: string, pinId: string): Promise<SavedPin[]> {
  const user = await findUserById(userId);
  if (!user) throw new Error("NOT_FOUND");
  const next = user.savedPins.filter((p) => p.id !== pinId);
  await writePins(userId, next);
  return next;
}
