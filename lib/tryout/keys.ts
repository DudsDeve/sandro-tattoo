import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_TRYOUT_MODEL, isModelId, type ModelId } from "@/lib/tryout/models";

const FILE = path.join(process.cwd(), "content", "ai-keys.json");

type Stored = { geminiApiKey?: string; tryoutModelId?: string };

async function readStored(): Promise<Stored> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as Stored;
  } catch {
    return {};
  }
}

export async function getGeminiApiKey(): Promise<string> {
  const stored = await readStored();
  const fromFile = stored.geminiApiKey?.trim();
  if (fromFile) return fromFile;
  return process.env.GEMINI_API_KEY?.trim() || "";
}

export async function getOpenAiApiKey(): Promise<string> {
  return process.env.OPENAI_API_KEY?.trim() || "";
}

export async function saveGeminiApiKey(key: string) {
  const next: Stored = { ...(await readStored()), geminiApiKey: key.trim() };
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
}

export async function getTryoutModelId(): Promise<ModelId> {
  const stored = await readStored();
  const id = stored.tryoutModelId?.trim();
  if (id && isModelId(id)) return id;
  return DEFAULT_TRYOUT_MODEL;
}

export async function saveTryoutModelId(id: ModelId) {
  const next: Stored = { ...(await readStored()), tryoutModelId: id };
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
}

export async function aiKeyStatus() {
  const gemini = await getGeminiApiKey();
  const openai = await getOpenAiApiKey();
  const tryoutModelId = await getTryoutModelId();
  return {
    openai: Boolean(openai),
    gemini: Boolean(gemini),
    geminiTail: gemini ? gemini.slice(-4) : "",
    tryoutModelId,
  };
}
