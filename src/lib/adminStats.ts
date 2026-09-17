// Server-only. Everything the admin dashboard shows from Stripe, gathered in
// two passes: one over customers, one over this event's PaymentIntents.
import type Stripe from 'stripe';
import {
  WAITLIST_SOURCE, athleteCountOf, donationCentsOf, eachEventCustomer, eachEventIntent,
} from '@/lib/stripeRegistration';
import { COMP_SOURCE } from '@/lib/compRegistration';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Sparkline window. 14 reads as "the last fortnight" at a glance. */
export const SERIES_DAYS = 14;

export interface PersonRow {
  name: string;
  email: string;
  at: string | null;
}

/** One value per day, oldest first, length SERIES_DAYS. */
export type DailySeries = number[];

export interface AdminStats {
  waitlist: { total: number; newThisWeek: number; recent: PersonRow[]; series: DailySeries };
  registrations: {
    total: number;
    athletes: number;
    newThisWeek: number;
    tenK: number;
    funRun: number;
    covered: number;
    recent: PersonRow[];
    series: DailySeries;
  };
  money: {
    totalCents: number;
    thisWeekCents: number;
    payingRegistrations: number;
    series: DailySeries;
  };
}

/** Index into the sparkline for a timestamp, or -1 if outside the window. */
function dayIndex(ms: number | null, startOfWindow: number): number {
  if (ms === null || ms < startOfWindow) return -1;
  const index = Math.floor((ms - startOfWindow) / DAY_MS);
  return index >= 0 && index < SERIES_DAYS ? index : -1;
}

function parseDate(value: string | undefined): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

function toRow(customer: Stripe.Customer, at: string | undefined): PersonRow {
  return {
    name: customer.name ?? '(no name)',
    email: customer.email ?? '',
    at: at ?? null,
  };
}

function byNewest(a: PersonRow, b: PersonRow): number {
  return (parseDate(b.at ?? undefined) ?? 0) - (parseDate(a.at ?? undefined) ?? 0);
}

export async function buildAdminStats(stripe: Stripe): Promise<AdminStats> {
  const now = Date.now();
  const cutoff = now - WEEK_MS;
  // Start at midnight so each bucket is a calendar day, not a rolling 24h slice.
  const todayStart = new Date(new Date(now).toDateString()).getTime();
  const windowStart = todayStart - (SERIES_DAYS - 1) * DAY_MS;

  const waitlistSeries: number[] = Array(SERIES_DAYS).fill(0);
  const registrationSeries: number[] = Array(SERIES_DAYS).fill(0);
  const moneySeries: number[] = Array(SERIES_DAYS).fill(0);

  const waitlist: PersonRow[] = [];
  const registrations: PersonRow[] = [];
  let waitlistNew = 0;
  let registrationsNew = 0;
  let athletes = 0;
  let tenK = 0;
  let funRun = 0;
  let covered = 0;

  const customerPass = eachEventCustomer(stripe, (customer) => {
    const meta = customer.metadata ?? {};

    if (meta.registered === 'true') {
      const row = toRow(customer, meta.registeredAt);
      registrations.push(row);
      const registeredMs = parseDate(meta.registeredAt);
      if ((registeredMs ?? 0) >= cutoff) registrationsNew++;
      const rIndex = dayIndex(registeredMs, windowStart);
      if (rIndex >= 0) registrationSeries[rIndex]++;

      athletes += athleteCountOf(customer);

      if (meta.raceType === 'fun-run') funRun++;
      else if (meta.raceType === '10k') tenK++;
      if (meta.source === COMP_SOURCE) covered++;
      return;
    }

    if (meta.source === WAITLIST_SOURCE) {
      waitlist.push(toRow(customer, meta.submittedAt));
      const joinedMs = parseDate(meta.submittedAt);
      if ((joinedMs ?? 0) >= cutoff) waitlistNew++;
      const wIndex = dayIndex(joinedMs, windowStart);
      if (wIndex >= 0) waitlistSeries[wIndex]++;
    }
  });

  let totalCents = 0;
  let thisWeekCents = 0;
  let payingRegistrations = 0;

  const intentPass = eachEventIntent(stripe, (intent) => {
    if (intent.status !== 'succeeded') return;
    // The donation, not the gross charge — registrants cover the card fee on
    // top of it, and that part never reaches us.
    const amount = donationCentsOf(intent);
    totalCents += amount;
    payingRegistrations++;
    const paidMs = intent.created * 1000;
    if (paidMs >= cutoff) thisWeekCents += amount;
    const mIndex = dayIndex(paidMs, windowStart);
    if (mIndex >= 0) moneySeries[mIndex] += amount;
  });

  await Promise.all([customerPass, intentPass]);

  waitlist.sort(byNewest);
  registrations.sort(byNewest);

  return {
    waitlist: {
      total: waitlist.length,
      newThisWeek: waitlistNew,
      recent: waitlist.slice(0, 4),
      series: waitlistSeries,
    },
    registrations: {
      total: registrations.length,
      athletes,
      newThisWeek: registrationsNew,
      tenK,
      funRun,
      covered,
      recent: registrations.slice(0, 4),
      series: registrationSeries,
    },
    money: { totalCents, thisWeekCents, payingRegistrations, series: moneySeries },
  };
}
