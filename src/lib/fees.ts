// Card processing fee math, shared by the registration form (client) and the
// action that creates the PaymentIntent (server). Pure functions only — this
// is imported from both sides, so keep it free of `use server`/`use client`.
import { STRIPE_FEE_FIXED_CENTS, STRIPE_FEE_PERCENT } from '@/config/site';

/**
 * What the card has to be charged for the chosen donation to arrive whole.
 *
 * The fee is a cut of the *charge*, not of the donation, so marking the
 * donation up by 2.9% still leaves Stripe taking 2.9% of the markup itself.
 * Solving `charge - (charge × rate + fixed) = donation` gives the division
 * below: on a $99 donation that's $102.26 rather than the $102.17 a plain
 * markup produces, and those 9¢ are exactly what would otherwise come out of
 * the gift. Set both fee constants to 0 to absorb the fee again and this
 * returns the donation untouched.
 */
export function chargeCentsFor(donationCents: number): number {
  const rate = STRIPE_FEE_PERCENT / 100;
  return Math.round((donationCents + STRIPE_FEE_FIXED_CENTS) / (1 - rate));
}

/** The processing fee riding on top of the donation, in cents. */
export function feeCentsFor(donationCents: number): number {
  return chargeCentsFor(donationCents) - donationCents;
}

/**
 * `$102.26`. Always two decimals — the fee makes the total uneven, and a
 * charge total rounded to whole dollars wouldn't match the card statement.
 */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
