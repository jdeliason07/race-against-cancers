// The optional "nonprofit partner" answer on the registration form: the link
// a partner shares to fill it in, how the answer is cleaned, and how the
// dashboard groups the answers. No server imports — the form needs the limit
// and the link, the server action the cleanup, the dashboard the grouping.
import { NONPROFIT_PARTNERS } from '@/config/site';

/** Room for any organization's full name. */
export const PARTNER_NAME_MAX_CHARS = 100;

// What people type into an optional box when the answer is no. Dropped rather
// than stored, so a "no" is never counted as somebody's affiliation.
const NEGATIVE_ANSWERS = new Set(['', 'no', 'n', 'na', 'none', 'nope', 'nothing', 'nil']);

/** Letters and digits only, lowercased: "Gather For Good!" and "gather for good" compare equal. */
function compact(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Tidies an answer for storage: one line, single spaces, control characters
 * dropped, cut to the limit above. A "no", "n/a" and the like come back as '',
 * and so does anything that isn't a string — the action is reachable by direct
 * POST, and a form loaded before the field existed sends nothing.
 */
export function cleanPartnerName(raw: unknown): string {
  if (typeof raw !== 'string') return '';

  const name = Array.from(raw.replace(/\s+/g, ' '))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 32 && code !== 127;
    })
    .slice(0, PARTNER_NAME_MAX_CHARS)
    .join('')
    .trim();

  return NEGATIVE_ANSWERS.has(compact(name)) ? '' : name;
}

const KNOWN_PARTNERS = NONPROFIT_PARTNERS.map(({ name }) => ({ name, key: compact(name) })).filter(
  (partner) => partner.key,
);

/**
 * Which partner an answer counts toward on the dashboard.
 *
 * Any answer containing a listed partner's name counts for that partner, under
 * the name as listed — "gather for good", "Gather For Good org" and "I'm with
 * Gather for Good" are all Gather for Good. Anything else is grouped with
 * answers spelled the same apart from case, spacing and punctuation, under the
 * first spelling seen, and left for a person to judge.
 */
export function partnerGroupOf(answer: string): { key: string; name: string } {
  const key = compact(answer);
  return KNOWN_PARTNERS.find((partner) => key.includes(partner.key)) ?? { key, name: answer };
}

// --- The partner's link ------------------------------------------------------
//
// /register?partner=gather-for-good fills the partner box in for whoever
// follows it, so the runners a partner brings are credited without anyone
// having to remember to type the name. Read on /register only, so that is the
// page the link must point at; remembered for the browser session, like the QR
// code in ./qrSource.ts, so leaving to read the FAQ and coming back doesn't
// lose it. The box stays editable: the link suggests, the runner says.

const KEY = 'rac_partner';

/** The `?partner=` value for a partner's link: "Gather for Good" → "gather-for-good". */
export function partnerSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * The listed partner a `?partner=` value names, or ''. Compared ignoring case,
 * spacing and punctuation, so "gatherforgood" and "Gather-For-Good" work too —
 * links get retyped. Only a listed partner counts, so an edited link can't put
 * just any name in the box.
 */
function partnerFromLink(value: string | null): string {
  const key = compact(value ?? '');
  if (!key) return '';
  return KNOWN_PARTNERS.find((partner) => partner.key === key)?.name ?? '';
}

/**
 * Reads `?partner=` off the current URL and remembers it. Safe to call on
 * every mount: a later visit without one keeps whichever link brought them.
 * Returns the partner's name in force, or ''.
 */
export function capturePartner(): string {
  if (typeof window === 'undefined') return '';
  try {
    const fromUrl = partnerFromLink(new URLSearchParams(window.location.search).get('partner'));
    if (fromUrl) {
      window.sessionStorage.setItem(KEY, fromUrl);
      return fromUrl;
    }
    // Re-checked against the list, in case a partner was removed since.
    return partnerFromLink(window.sessionStorage.getItem(KEY));
  } catch {
    // Private browsing and blocked site data both throw here. The box is still
    // there to type in; nothing about registering may depend on this.
    return '';
  }
}
