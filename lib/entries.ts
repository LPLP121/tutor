// Splits pasted material into entries.
//
// If the text has a blank line anywhere, entries are separated by blank
// lines, so a whole email with a greeting, body and sign-off stays one entry.
// If there is no blank line, every line is its own entry.
//
// The run page and /api/run both call this, so the count the learner sees
// on the button is the count the server actually runs.

const BLANK_LINE = /\n\s*\n/;

export function splitEntries(raw: string): string[] {
  const text = raw.replace(/\r/g, '');
  const parts = BLANK_LINE.test(text) ? text.split(BLANK_LINE) : text.split('\n');
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}
