import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth/session";

export async function POST() {
  await clearUserSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearUserSession();
  return NextResponse.json({ ok: true });
}
