// Server-only. Builds the referral tally that gets emailed each week.
import type Stripe from 'stripe';
import { REFERRAL_PAYOUT_EXEMPT_FIRST_NAMES } from '@/config/site';

export interface ReferralRow {
  /** Name as the first referred friend spelled it. */
  name: string;
  /** Registrations naming this person in the reporting window. */
  newCount: number;
  /** Registrations naming this person, all time. */
  totalCount: number;
  /** Who they referred in the window, for spot-checking. */
  newlyReferred: string[];
}

export interface ReferralReport {
  rows: ReferralRow[];
  newTotal: number;
  /**
   * Every referral ever recorded, and so the number of rewards owed: one per
   * referral, organizers excluded. Nothing here tracks what has already been
   * handed out, so this only shrinks if a registration is deleted in Stripe.
   */
  allTimeTotal: number;
  sinceISO: string;
}

/** Groups "john  SMITH" and "John Smith" together without losing the spelling. */
function groupingKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

const EXEMPT_FIRST_NAMES = new Set(
  REFERRAL_PAYOUT_EXEMPT_FIRST_NAMES.map((name) => name.trim().toLowerCase()).filter(Boolean),
);

/**
 * True for the organizers, who refer people but are not owed a reward. Compares
 * the first word only — registrants usually type a bare first name — so this is
 * deliberately blunt; see the note on the constant in site.ts.
 */
function isExemptFromReward(name: string): boolean {
  return EXEMPT_FIRST_NAMES.has(name.trim().split(/\s+/)[0].toLowerCase());
}

/**
 * Counts completed registrations that named a referrer. Derived from the
 * records every time, so re-running never double-counts and a repeated webhook
 * delivery can't inflate anyone's total.
 */
export async function buildReferralReport(
  stripe: Stripe,
  windowDays = 7,
): Promise<ReferralReport> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const groups = new Map<string, ReferralRow>();
  let newTotal = 0;
  let allTimeTotal = 0;

  await stripe.customers
    .search({ query: "metadata['registered']:'true'", limit: 100 })
    .autoPagingEach((customer) => {
      const referrer = customer.metadata?.referredByName?.trim();
      if (!referrer) return;
      // Dropped here rather than at render time so every consumer — the
      // dashboard banner, the list, the weekly email — agrees on the totals.
      if (isExemptFromReward(referrer)) return;

      const key = groupingKey(referrer);
      const row = groups.get(key) ?? {
        name: referrer.replace(/\s+/g, ' '),
        newCount: 0,
        totalCount: 0,
        newlyReferred: [],
      };

      row.totalCount++;
      allTimeTotal++;

      const registeredAt = customer.metadata?.registeredAt;
      if (registeredAt && new Date(registeredAt) >= since) {
        row.newCount++;
        newTotal++;
        row.newlyReferred.push(customer.name ?? customer.email ?? '(unnamed)');
      }

      groups.set(key, row);
    });

  const rows = [...groups.values()].sort(
    (a, b) => b.newCount - a.newCount || b.totalCount - a.totalCount,
  );

  return { rows, newTotal, allTimeTotal, sinceISO: since.toISOString() };
}
