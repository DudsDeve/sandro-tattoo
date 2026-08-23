import { NextResponse } from "next/server";
import { mutateCmsStore } from "@/lib/cms/store";

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const store = await mutateCmsStore((s) => {
    s.clients = (s.clients || []).filter((c) => c.id !== id);
    return s;
  });
  return NextResponse.json(store);
}
