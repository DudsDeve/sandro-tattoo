export type SiteFieldType = "text" | "textarea" | "image" | "video";

export type SiteFieldDef = {
  id: string;
  label: string;
  type: SiteFieldType;
  /** Default when nothing saved in CMS */
  defaultValue: string;
  section?: string;
};

export type SitePageDef = {
  path: string;
  label: string;
  description: string;
  fields: SiteFieldDef[];
};

export type SiteContentMap = Record<string, string>;
