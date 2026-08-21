import { NextResponse } from "next/server";
import { getCmsStore, mutateCmsStore } from "@/lib/cms/store";
import { getFieldDef, getSitePage, SITE_PAGES } from "@/lib/site-editor/registry";

export async function GET() {
  const store = await getCmsStore();
  return NextResponse.json({ siteContent: store.siteContent || {} });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    siteContent?: Record<string, string>;
    fieldId?: string;
    value?: string;
    /** Restaura valores padrão do registry (ainda provisórios até o padrão final). */
    reset?: "field" | "page" | "all";
    pagePath?: string;
  };

  const appliedDefaults: Record<string, string> = {};

  const store = await mutateCmsStore((s) => {
    const current = { ...(s.siteContent || {}) };

    if (body.reset === "all") {
      for (const page of SITE_PAGES) {
        for (const field of page.fields) {
          delete current[field.id];
          appliedDefaults[field.id] = field.defaultValue;
        }
      }
    } else if (body.reset === "page" && body.pagePath) {
      const page = getSitePage(body.pagePath);
      if (page) {
        for (const field of page.fields) {
          delete current[field.id];
          appliedDefaults[field.id] = field.defaultValue;
        }
      }
    } else if (body.reset === "field" && body.fieldId) {
      delete current[body.fieldId];
      const hit = getFieldDef(body.fieldId);
      appliedDefaults[body.fieldId] = hit?.field.defaultValue ?? "";
    } else {
      if (body.siteContent && typeof body.siteContent === "object") {
        Object.assign(current, body.siteContent);
      }
      if (body.fieldId && typeof body.value === "string") {
        if (body.value === "") delete current[body.fieldId];
        else current[body.fieldId] = body.value;
      }
    }

    s.siteContent = current;
    return s;
  });

  return NextResponse.json({
    siteContent: store.siteContent || {},
    appliedDefaults,
    store,
  });
}
