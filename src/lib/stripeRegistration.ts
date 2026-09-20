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
 * How long after someone starts registration we wait before calling it
 * abandoned.
 *
 * `startedRegistrationAt` is stamped the moment the PaymentIntent is created —
 * which is while the card fields are still empty. Without this window, someone
 * mid-typing would be counted as a drop-off and emailed asking why they didn't
 * finish, seconds before they do.
 */
export const INCOMPLETE_GRACE_MS = 30 * 60 * 1000;

/**
 * Someone who filled in the registration form and never completed the payment.
 *
 * The two halves of that are recorded in different places on purpose:
 * `startedRegistrationAt` is written by the registration action when the
 * PaymentIntent is created, and `registered` only by the webhook once the
 * payment actually succeeds. Anyone carrying the first without the second
 * stopped somewhere in between.
 *
 * Callers that act on this — emailing them, above all — should also rule out a
 * successful payment with `paidCustomerIds`, since the flag this reads is
 * webhook-written and a webhook can fail.
 */
export function isIncompleteRegistration(
  customer: Stripe.Customer,
  now: number = Date.now(),
): boolean {
  if (isRegistered(customer)) return false;
  const started = customer.metadata?.startedRegistrationAt;
  if (!started) return false;
  const startedMs = Date.parse(started);
  // An unparseable stamp is old or garbled, never in-flight.
  return !Number.isFinite(startedMs) || now - startedMs >= INCOMPLETE_GRACE_MS;
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
 * Walks every PaymentIntent belonging to this event.
 *
 * Uses search rather than listing the whole account so Stripe does the
 * filtering. The search index lags writes by up to a minute, which is within
 * the 60s revalidate window on the pages that call this.
 */
export async function eachEventIntent(
  stripe: Stripe,
  visit: (intent: Stripe.PaymentIntent) => void,
): Promise<void> {
  await stripe.paymentIntents
    .search({ query: `metadata['event']:'${EVENT_NAME}'`, limit: 100 })
    .autoPagingEach((intent) => {
      visit(intent);
    });
}

/**
 * Every customer who has actually paid for this event, by Stripe id.
 *
 * The `registered` flag is only as good as the webhook that writes it, so on
 * its own it can't be trusted to say someone *didn't* pay: a misconfigured
 * endpoint or a failed delivery leaves a paid registrant looking exactly like
 * an abandoned one. A succeeded charge is the ground truth, and this is what
 * keeps a webhook outage from mailing "you never finished" to people who did.
 */
export async function paidCustomerIds(stripe: Stripe): Promise<Set<string>> {
  const ids = new Set<string>();
  await eachEventIntent(stripe, (intent) => {
    if (intent.status !== 'succeeded') return;
    const id = typeof intent.customer === 'string' ? intent.customer : intent.customer?.id;
    if (id) ids.add(id);
  });
  return ids;
}
