import { NextResponse } from "next/server";
import { listUsers } from "@/lib/auth/accounts";

export async function GET() {
  const users = await listUsers();
  return NextResponse.json({ users });
}
