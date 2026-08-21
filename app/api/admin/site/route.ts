import { NextResponse } from "next/server";
import { getCmsStore, mutateCmsStore } from "@/lib/cms/store";

export async function GET() {
  const store = await getCmsStore();
  return NextResponse.json({ siteContent: store.siteContent || {} });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    siteContent?: Record<string, string>;
    fieldId?: string;
    value?: string;
  };

  const store = await mutateCmsStore((s) => {
    const current = { ...(s.siteContent || {}) };
    if (body.siteContent && typeof body.siteContent === "object") {
      Object.assign(current, body.siteContent);
    }
    if (body.fieldId && typeof body.value === "string") {
      if (body.value === "") delete current[body.fieldId];
      else current[body.fieldId] = body.value;
    }
    s.siteContent = current;
    return s;
  });

  return NextResponse.json({ siteContent: store.siteContent || {}, store });
}
