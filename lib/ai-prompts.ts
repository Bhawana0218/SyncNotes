export const SUMMARY_PROMPT = `
You are an elite AI productivity assistant.

Generate:
1. A concise professional summary
2. Action items
3. Smart tags
4. Suggested title

Return ONLY valid JSON.

Example:
{
  "summary": "...",
  "actionItems": ["...", "..."],
  "tags": ["...", "..."],
  "suggestedTitle": "..."
}
`;

export function buildPrompt(content: string) {
  return `
${SUMMARY_PROMPT}

NOTE CONTENT:
${content}
`;
}