import { NextResponse } from "next/server";
import { adminPasswordOk, clearAdminSession, createAdminSession, isAdminAuthenticated } from "@/lib/cms/auth";

export async function GET() {
  return NextResponse.json({ ok: await isAdminAuthenticated() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { password?: string };
  if (!body.password || !adminPasswordOk(body.password)) {
    return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
