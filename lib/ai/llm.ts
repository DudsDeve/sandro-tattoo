import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export function hasLlmKey() {
  return Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}

export function llmModel() {
  if (process.env.OPENAI_API_KEY) {
    return openai(process.env.OPENAI_MODEL ?? "gpt-4o");
  }
  return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929");
}
