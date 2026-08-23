import { NextResponse } from "next/server";
import { findUserById, publicUser } from "@/lib/auth/accounts";
import { readUserSessionId } from "@/lib/auth/session";

export async function GET() {
  const id = await readUserSessionId();
  if (!id) return NextResponse.json({ user: null });
  const user = await findUserById(id);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: publicUser(user) });
}
