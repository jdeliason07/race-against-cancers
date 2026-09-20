// Server-only. Builds the referral tally that gets emailed each week.
import type Stripe from 'stripe';
import {
  REFERRAL_MIN_DONATION_DOLLARS,
  REFERRAL_PAYOUT_EXEMPT_FIRST_NAMES,
} from '@/config/site';

/** A referral that arrived, but whose registration donated too little to earn a reward. */
export interface Shortfall {
  /** The referred registrant, as Stripe has them. */
  name: string;
  /** What they actually gave, in cents, net of the card fee. */
  donatedCents: number;
  /** How far under the minimum that left them, in cents. Always positive. */
  shortCents: number;
}

export interface ReferralRow {
  /** Name as the first referred friend spelled it. */
  name: string;
  /** Rewarded registrations naming this person in the reporting window. */
  newCount: number;
  /** Rewarded registrations naming this person, all time. */
  totalCount: number;
  /**
   * Registrations naming this person that missed the donation minimum, all
   * time, nearest miss first. Kept with their amounts rather than discarded or
   * merely counted: a referral that came $1 short and one that came $90 short
   * are the same row otherwise, and only one of them is worth honouring
   * anyway.
   */
  belowMinimum: Shortfall[];
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
  /** How many referrals were real but whose registration donated too little. */
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

/** How a referred registrant is identified back to the organizer. */
function referredName(customer: Stripe.Customer): string {
  return customer.name ?? customer.email ?? '(unnamed)';
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
        belowMinimum: [],
        newlyReferred: [],
      };

      // A referral is real either way — it just doesn't earn a card unless the
      // registration it brought in cleared the minimum.
      const donatedCents = donatedCentsOf(customer);
      if (donatedCents < MINIMUM_DONATION_CENTS) {
        row.belowMinimum.push({
          name: referredName(customer),
          donatedCents,
          shortCents: MINIMUM_DONATION_CENTS - donatedCents,
        });
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
        row.newlyReferred.push(referredName(customer));
      }

      groups.set(key, row);
    });

  // Nearest miss first within a row: the near-misses are the only ones there is
  // a decision to make about.
  for (const row of groups.values()) {
    row.belowMinimum.sort((a, b) => a.shortCents - b.shortCents);
  }

  // Whoever is owed the most comes first; the rows that earned nothing sink to
  // the bottom rather than being dropped, so a referrer is never invisible.
  const rows = [...groups.values()].sort(
    (a, b) =>
      b.newCount - a.newCount ||
      b.totalCount - a.totalCount ||
      b.belowMinimum.length - a.belowMinimum.length,
  );

  return { rows, newTotal, allTimeTotal, belowMinimumTotal, sinceISO: since.toISOString() };
}
