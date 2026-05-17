import OpenAI from "openai";

let _openai: OpenAI | null = null;

// Lazy getter — OpenAI client is only instantiated on first actual use,
// never at module import time (which would crash during next build).
export function getOpenAI(): OpenAI {
  if (!_openai) {
    const isOpenRouter = !!process.env.OPENROUTER_API_KEY;
    _openai = new OpenAI({
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
  }
  return _openai;
}

// Keep the named `openai` export for backwards compatibility.
// Proxy defers construction until first property access.
export const openai: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as any)[prop];
  },
});
