// Server-only. Builds the referral tally that gets emailed each week.
import type Stripe from 'stripe';
import {
  REFERRAL_MIN_DONATION_DOLLARS,
  REFERRAL_PAYOUT_EXEMPT_FIRST_NAMES,
} from '@/config/site';

export interface ReferralRow {
  /** Name as the first referred friend spelled it. */
  name: string;
  /** Rewarded registrations naming this person in the reporting window. */
  newCount: number;
  /** Rewarded registrations naming this person, all time. */
  totalCount: number;
  /**
   * Registrations naming this person whose donation fell under the minimum, all
   * time. Counted rather than discarded so a referrer who looks empty can be
   * told why, instead of the referral just vanishing.
   */
  belowMinimumCount: number;
  /** Who they referred in the window, for spot-checking. */
  newlyReferred: string[];
}

export interface ReferralReport {
  rows: ReferralRow[];
  newTotal: number;
  /**
   * Every referral that earned a reward, and so the number owed: one per
   * qualifying referral, organizers excluded. Nothing here tracks what has
   * already been handed out, so this only shrinks if a registration is deleted
   * in Stripe.
   */
  allTimeTotal: number;
  /** Referrals that were real but whose registration donated too little. */
  belowMinimumTotal: number;
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

const MINIMUM_DONATION_CENTS = REFERRAL_MIN_DONATION_DOLLARS * 100;

/**
 * What the referred person actually gave, in cents.
 *
 * The webhook copies this off the succeeded PaymentIntent as `donationAmount`,
 * already net of the card fee the registrant covered. A record without it is
 * read as zero: an unproven donation is not evidence of a qualifying one, and
 * an unearned card is the more expensive mistake to make by default. Comped
 * entries carry a literal '0' and fall out here for the same reason.
 */
function donatedCentsOf(customer: Stripe.Customer): number {
  const cents = Number.parseInt(customer.metadata?.donationAmount ?? '', 10);
  return Number.isInteger(cents) && cents > 0 ? cents : 0;
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
  let belowMinimumTotal = 0;

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
        belowMinimumCount: 0,
        newlyReferred: [],
      };

      // A referral is real either way — it just doesn't earn a card unless the
      // registration it brought in cleared the minimum.
      if (donatedCentsOf(customer) < MINIMUM_DONATION_CENTS) {
        row.belowMinimumCount++;
        belowMinimumTotal++;
        groups.set(key, row);
        return;
      }

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

  // Whoever is owed the most comes first; the rows that earned nothing sink to
  // the bottom rather than being dropped, so a referrer is never invisible.
  const rows = [...groups.values()].sort(
    (a, b) =>
      b.newCount - a.newCount ||
      b.totalCount - a.totalCount ||
      b.belowMinimumCount - a.belowMinimumCount,
  );

  return { rows, newTotal, allTimeTotal, belowMinimumTotal, sinceISO: since.toISOString() };
}
