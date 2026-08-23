import { NextResponse } from "next/server";
import { createUser, findUserByEmail, publicUser } from "@/lib/auth/accounts";
import { hashPassword } from "@/lib/auth/passwords";
import { createUserSession } from "@/lib/auth/session";

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; email?: string; password?: string };
    const name = body.name?.trim() || "";
    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";
    if (name.length < 2) return NextResponse.json({ error: "Informe seu nome" }, { status: 400 });
    if (!validEmail(email)) return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
    if (password.length < 8) {
      return NextResponse.json({ error: "A senha precisa ter pelo menos 8 caracteres" }, { status: 400 });
    }
    if (await findUserByEmail(email)) {
      return NextResponse.json({ error: "Já existe uma conta com este e-mail" }, { status: 409 });
    }
    const user = await createUser({
      name,
      email,
      passwordHash: await hashPassword(password),
    });
    await createUserSession(user.id);
    return NextResponse.json({ user: publicUser(user) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar conta";
    if (msg === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "Já existe uma conta com este e-mail" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
