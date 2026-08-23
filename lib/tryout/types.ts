export type Tool = "brush" | "rectangle" | "ellipse" | "eraser";

export type DrawPath =
  | { type: "brush" | "eraser"; points: number[]; brushSize: number }
  | { type: "rectangle" | "ellipse"; x: number; y: number; width: number; height: number };

export function isMarkShape(
  path: DrawPath,
): path is Extract<DrawPath, { type: "rectangle" | "ellipse" }> {
  return path.type === "rectangle" || path.type === "ellipse";
}

export type TryoutStep = "upload" | "mark" | "design" | "preview";

export type TryoutDesign = {
  id: string;
  name: string;
  imageUrl: string;
  style: string;
  artistName: string;
  artistSlug: string;
};

export type GenerateInput = {
  bodyImage: string;
  maskImage: string;
  designImage: string;
  designName: string;
  designStyle: string;
  bodyPart?: string;
  /** Unedited client photo — models must keep this identity. */
  originalBodyImage?: string;
};

export type TryoutSession = {
  previewImageUrl: string;
  originalBodyImage: string;
  designName: string;
  designStyle: string;
  designArtistSlug: string;
  isCustomDesign: boolean;
  modelUsed: string;
  timestamp: number;
};
