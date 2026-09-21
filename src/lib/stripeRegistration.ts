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

/**
 * What a registration donated, in cents, as recorded on the customer by the
 * webhook — or null when the record predates that field.
 *
 * Null rather than 0 on purpose: a covered entry really did give nothing, and
 * a record from before `donationAmount` was written is simply unknown. Printing
 * both as "$0" would invent a fact about the second one. The dashboard's raised
 * total still comes from the PaymentIntents, never from a sum of these.
 */
export function recordedDonationCentsOf(customer: Stripe.Customer): number | null {
  const parsed = Number.parseInt(customer.metadata?.donationAmount ?? '', 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

/**
 * How many athletes a registration covers.
 *
 * One person can register and pay for a group, so the count of registrations
 * and the count of runners are different numbers. Metadata is free-form, so a
 * missing or nonsense value falls back to the single athlete we know about.
 */
export function athleteCountOf(customer: Stripe.Customer): number {
  const count = Number.parseInt(customer.metadata?.participantCount ?? '1', 10);
  return Number.isInteger(count) && count > 0 ? count : 1;
}

/**
 * Walks every Customer belonging to this event — registrants, the waitlist,
 * and comped entries alike. Callers filter on metadata for the ones they want.
 */
export async function eachEventCustomer(
  stripe: Stripe,
  visit: (customer: Stripe.Customer) => void,
): Promise<void> {
  await stripe.customers
    .search({ query: `metadata['event']:'${EVENT_NAME}'`, limit: 100 })
    .autoPagingEach((customer) => {
      visit(customer);
    });
}

/**
 * Walks every charge in the account, with its PaymentIntent expanded.
 *
 * Charges rather than PaymentIntents, and a list rather than a search on the
 * event tag: money arrives here that this app never created — a sponsor's
 * invoice, a Payment Link, a charge entered by hand — and none of it carries
 * that tag, because only the registration form writes one. It is all still
 * money raised for the race, and a tag search silently left it out.
 *
 * Listing also sidesteps the search index, which lags writes by up to a
 * minute.
 */
export async function eachAccountCharge(
  stripe: Stripe,
  visit: (charge: Stripe.Charge) => void,
): Promise<void> {
  await stripe.charges
    .list({ limit: 100, expand: ['data.payment_intent'] })
    .autoPagingEach((charge) => {
      visit(charge);
    });
}

/** The PaymentIntent behind a charge, when one was expanded onto it. */
export function intentOf(charge: Stripe.Charge): Stripe.PaymentIntent | null {
  return typeof charge.payment_intent === 'object' && charge.payment_intent !== null
    ? charge.payment_intent
    : null;
}

/**
 * Which event a charge belongs to, or null when nothing says.
 *
 * A registration is tagged on its PaymentIntent. An invoice or a link is
 * tagged only if someone typed it into the Dashboard, which is why "null"
 * here means "untagged", never "not ours".
 */
export function eventTagOf(charge: Stripe.Charge): string | null {
  return intentOf(charge)?.metadata?.event ?? charge.metadata?.event ?? null;
}
