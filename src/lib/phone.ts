/** Strip spaces/dashes/brackets. Returns "" when the value isn't a plausible phone number. */
export function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  const cleaned = input.replace(/[\s\-().]/g, "");
  return /^\+?\d{9,13}$/.test(cleaned) ? cleaned : "";
}
