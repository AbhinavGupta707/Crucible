export const NON_NEGOTIABLES = `
Non-negotiables for every Crucible AI output:
- Return ONLY valid JSON that matches the requested schema. No prose, no markdown fences.
- Never invent prospect facts that are not present in the input. If unknown, omit or say so.
- Never claim synthetic predictions are real market proof.
- Never produce deceptive subject lines or fake familiarity ("hey, remembered our chat").
- Use plain, direct language. Avoid hype words ("revolutionary", "game-changing", "synergy").
- Treat no-reply as weak evidence, not proof.
`.trim();

export function jsonOnlyReminder(): string {
  return "Respond with a single JSON object only. No prose. No markdown code fences. No commentary.";
}

export function describeSchema(name: string, fields: string[]): string {
  return `Required JSON shape (schema "${name}") with fields:\n- ${fields.join(
    "\n- "
  )}`;
}
