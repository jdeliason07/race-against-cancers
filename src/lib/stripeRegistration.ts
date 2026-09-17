// Server-only Stripe helpers shared by the registration action, the webhook,
// and the spots/donation counters. Do not import this from a Client Component.
import Stripe from 'stripe';
import { EVENT_NAME } from '@/config/site';

/** metadata.source on customers who joined the waitlist. */
export const WAITLIST_SOURCE = 'pre-signup-form';

/** Returns null when Stripe isn't configured, so callers can degrade gracefully. */
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * Emails are case-insensitive in practice but Stripe's `email` filter is not,
 * so store and look up one canonical form — otherwise "Jane@x.com" and
 * "jane@x.com" become two customers and the duplicate check misses.
 */
export function canonicalEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findCustomerByEmail(
  stripe: Stripe,
  email: string,
): Promise<Stripe.Customer | null> {
  const { data } = await stripe.customers.list({ email: canonicalEmail(email), limit: 1 });
  return data[0] ?? null;
}

/** True once a successful registration has been recorded on the customer. */
export function isRegistered(customer: Stripe.Customer): boolean {
  return customer.metadata?.registered === 'true';
}

/**
 * The donation inside a charge, in cents.
 *
 * Registrants cover Stripe's fee, so the charge is the donation plus that fee
 * — and every total we report is about donations, not about the cut the card
 * network takes. Intents created before the fee was added on top carry no
 * `donationCents`, and for those the whole charge was the donation, so they
 * still count correctly.
 */
export function donationCentsOf(intent: Stripe.PaymentIntent): number {
  const charged = intent.amount_received || intent.amount;
  const recorded = Number.parseInt(intent.metadata?.donationCents ?? '', 10);
  // Guarded rather than trusted: metadata is free-form, and a donation larger
  // than the charge would inflate the total it's meant to keep honest.
  return Number.isInteger(recorded) && recorded > 0 && recorded <= charged ? recorded : charged;
}

/** True for a payment raised by the registration form, which always tags the
 * race someone signed up for. Donations taken any other way carry no raceType,
 * so they are money raised but not a registration. */
export function isRegistrationIntent(intent: Stripe.PaymentIntent): boolean {
  return Boolean(intent.metadata?.raceType);
}

/**
 * Walks every PaymentIntent that counts toward this event's total.
 *
 * Only the registration form stamps `metadata.event`, so a tag is treated as
 * grounds for EXCLUSION, never for inclusion: an intent counts unless it is
 * explicitly tagged to some other event. Requiring the tag instead silently
 * dropped every donation taken another way — payment links, invoices, payments
 * raised from the Stripe dashboard, anything predating the tag — and a public
 * total that quietly omits real gifts is worse than one that overcounts a
 * stray charge, because nobody can see that it is wrong.
 *
 * Lists rather than searches for the same reason: the search index only covers
 * what has been indexed and lags writes by up to a minute, while list is
 * immediately consistent and does not depend on metadata existing at all.
 */
export async function eachDonationIntent(
  stripe: Stripe,
  visit: (intent: Stripe.PaymentIntent) => void,
): Promise<void> {
  await stripe.paymentIntents.list({ limit: 100 }).autoPagingEach((intent) => {
    const tag = intent.metadata?.event;
    if (tag && tag !== EVENT_NAME) return;
    visit(intent);
  });
}
