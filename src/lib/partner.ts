// The optional "nonprofit partner" answer on the registration form, and how
// the dashboard groups the answers. Pure, with no server imports — the form
// needs the limit, the server action the cleanup, the dashboard the grouping.
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

const KNOWN_PARTNERS = NONPROFIT_PARTNERS.map((name) => ({ name, key: compact(name) })).filter(
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
