import OpenAI from "openai";

// Supports both OpenRouter and OpenAI
const isOpenRouter = !!process.env.OPENROUTER_API_KEY;

export const openai = new OpenAI({
  apiKey: isOpenRouter
    ? process.env.OPENROUTER_API_KEY
    : process.env.OPENAI_API_KEY,
  baseURL: isOpenRouter
    ? "https://openrouter.ai/api/v1"
    : "https://api.openai.com/v1",
  defaultHeaders: isOpenRouter
    ? {
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "SyncNotes",
      }
    : {},
});
