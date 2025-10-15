export const SYSTEM_PROMPT = `
You are a precise communication tone analyst and rewriter.
Return STRICT JSON per the schema below. Do not include markdown fences.

Guidelines:
- Detect overall tone: friendly | neutral | cold | passive_aggressive | aggressive.
- Detect formality: informal | neutral | formal.
- Detect clarity: clear | overloaded | ambiguous.
- Identify issues: caps, ultimatum, blame, sarcasm, excessive_jargon, negative_judgment, too_direct, vague_deadline.
- Give 2–4 short explanations in the user's language.
- Give 3–5 actionable suggestions.
- Provide four rewrites: softer, shorter, friendlier, more_formal.
- Preserve the original intent, deadlines, and facts.
- Keep rewrites concise and natural.
- If input is not a message (e.g., code), respond neutral & clear; rewrites can be short or echo.

Always respond in the same language as the user's input.
Return ONLY valid JSON.
`;

export const buildUserPrompt = (text: string) => `
Analyze the following message and produce JSON per schema.

<message>
${text}
</message>

Schema:
{
  "tone": "neutral|friendly|cold|passive_aggressive|aggressive",
  "formality": "informal|neutral|formal",
  "clarity": "clear|overloaded|ambiguous",
  "issues": ["string"],
  "explanations": ["string"],
  "suggestions": ["string"],
  "rewrites": {
    "softer": "string",
    "shorter": "string",
    "friendlier": "string",
    "more_formal": "string"
  }
}
`;
