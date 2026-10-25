// The optional note a registrant writes for this year's beneficiary. Every
// note is printed into a book for him from /admin/notes. Pure, with no server
// imports — the register form needs the limit, the server actions need the
// cleanup.

/** What the form lets someone type. A note, not a letter — it has to fit a page with others. */
export const BENEFICIARY_NOTE_MAX_CHARS = 300;

// Stripe caps a metadata value at 500 characters, and the note rides in
// metadata. Capping the UTF-8 bytes as well means a note full of emoji or
// accented letters still fits however Stripe counts — an oversized value would
// fail the whole PaymentIntent, and a note must never cost someone their entry.
const MAX_BYTES = 500;

const encoder = new TextEncoder();

/**
 * Tidies a note for storage: line breaks kept (at most one blank line in a
 * row), runs of spaces and control characters dropped, and the result cut to
 * the limits above. Anything that isn't a string — the actions are reachable
 * by direct POST, and forms loaded before the field existed send nothing —
 * comes back as ''.
 */
export function cleanBeneficiaryNote(raw: unknown): string {
  if (typeof raw !== 'string') return '';

  const text = Array.from(raw.replace(/\r\n?/g, '\n').replace(/\t/g, ' '))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return ch === '\n' || (code >= 32 && code !== 127);
    })
    .join('')
    .replace(/[  ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  let kept = '';
  let chars = 0;
  let bytes = 0;
  for (const ch of text) {
    const size = encoder.encode(ch).length;
    if (chars + 1 > BENEFICIARY_NOTE_MAX_CHARS || bytes + size > MAX_BYTES) break;
    kept += ch;
    chars += 1;
    bytes += size;
  }
  return kept.trimEnd();
}
