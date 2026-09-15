// Server-only. Comped ("covered") registrations: a sponsor pays for a block of
// entries, and each athlete claims one through a private link instead of paying.
//
// The code lives in COMP_REGISTRATION_CODE — an environment variable, never
// src/config/site.ts, because that file is imported by Client Components and
// would ship the code to every visitor's browser.
//
//   COMP_REGISTRATION_CODE   the secret in the link, e.g. a long random string
//   COMP_REGISTRATION_LIMIT  how many free entries it may create (default 0)
import type Stripe from 'stripe';
import { EVENT_NAME } from '@/config/site';

export const COMP_SOURCE = 'comp-registration';

export interface CompStatus {
  code: string;
  used: number;
  limit: number;
  remaining: number;
}

/** Timing-safe-ish comparison; codes are short so length leaks little. */
function matches(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function configuredLimit(): number {
  const parsed = Number.parseInt(process.env.COMP_REGISTRATION_LIMIT ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * How many free entries this code has already created.
 *
 * Stripe's search index lags writes by up to a minute, so two people claiming
 * the last entry within the same minute could both get through. Over-issuing
 * by one or two is an acceptable trade for not running a database; set the
 * limit to the number you actually sold and treat it as approximate.
 */
async function countUsed(stripe: Stripe, code: string): Promise<number | null> {
  try {
    let used = 0;
    await stripe.customers
      .search({ query: `metadata['compCode']:'${code}'`, limit: 100 })
      .autoPagingEach(() => {
        used++;
      });
    return used;
  } catch (err) {
    // Null means "couldn't tell". The caller refuses the link rather than
    // handing out free entries it can't count.
    console.error('Could not count covered registrations:', err);
    return null;
  }
}

/**
 * Why a link was refused. A visitor sees one generic message for all of these
 * on purpose — an invite link is a secret, and a page that says "right code,
 * wrong limit" tells an attacker they guessed the code. The organizer still
 * needs to tell these apart when setting the block up, so the reason goes to
 * the server log (Vercel → Deployments → Runtime Logs) and never to the page.
 */
type RefusalReason =
  | 'code-not-configured'
  | 'limit-not-configured'
  | 'no-code-in-link'
  | 'code-mismatch'
  | 'count-unavailable'
  | 'block-exhausted';

const REFUSAL_HELP: Record<RefusalReason, string> = {
  'code-not-configured': 'COMP_REGISTRATION_CODE is unset or empty. Set it and redeploy.',
  'limit-not-configured':
    'COMP_REGISTRATION_LIMIT is unset, zero, or not a positive whole number. Set it and redeploy.',
  'no-code-in-link': 'The link had no code after /register/invite/.',
  'code-mismatch': 'The code in the link does not match COMP_REGISTRATION_CODE.',
  'count-unavailable': 'Stripe could not be searched, so claimed entries could not be counted.',
  'block-exhausted': 'Every entry this code covers has already been claimed.',
};

/**
 * Logs why a link was refused, without ever logging the code itself — a
 * server log is not a safe place for a shared secret. Lengths are enough to
 * spot a truncated paste, which is the usual cause of a mismatch.
 */
function refuse(reason: RefusalReason, detail?: Record<string, unknown>): null {
  console.warn(
    `[comp-registration] link refused: ${reason} — ${REFUSAL_HELP[reason]}`,
    detail ?? {},
  );
  return null;
}

/**
 * Validates a code from a link. Returns null when comped registration is
 * switched off, the code is wrong, or the block is used up — the caller
 * shouldn't distinguish those in what it shows a visitor. The reason is
 * logged server-side; see RefusalReason above.
 */
export async function checkCompCode(
  stripe: Stripe,
  candidate: string,
): Promise<CompStatus | null> {
  const expected = process.env.COMP_REGISTRATION_CODE?.trim();
  const limit = configuredLimit();
  if (!expected) return refuse('code-not-configured');
  if (limit === 0) {
    return refuse('limit-not-configured', { rawValue: process.env.COMP_REGISTRATION_LIMIT });
  }

  const supplied = candidate.trim();
  if (!supplied) return refuse('no-code-in-link');
  if (!matches(supplied, expected)) {
    return refuse('code-mismatch', {
      suppliedLength: supplied.length,
      expectedLength: expected.length,
    });
  }

  const used = await countUsed(stripe, expected);
  if (used === null) return refuse('count-unavailable');
  if (used >= limit) return refuse('block-exhausted', { used, limit });

  return { code: expected, used, limit, remaining: limit - used };
}

/** Metadata stamped on a comped registration's customer record. */
export function compMetadata(code: string): Record<string, string> {
  return {
    source: COMP_SOURCE,
    event: EVENT_NAME,
    compCode: code,
    donationAmount: '0',
  };
}
