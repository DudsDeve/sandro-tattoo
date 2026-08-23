import { NextResponse } from "next/server";
import { findUserByEmail, publicUser } from "@/lib/auth/accounts";
import { verifyPassword } from "@/lib/auth/passwords";
import { createUserSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "E-mail ou senha incorretos" }, { status: 401 });
    }
    await createUserSession(user.id);
    return NextResponse.json({ user: publicUser(user) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao entrar" }, { status: 400 });
  }
}
