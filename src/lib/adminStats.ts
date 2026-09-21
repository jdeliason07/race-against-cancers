// Server-only. Everything the admin dashboard shows from Stripe, gathered in
// two passes: one over customers, one over this event's PaymentIntents.
import type Stripe from 'stripe';
import {
  WAITLIST_SOURCE, athleteCountOf, donationCentsOf, eachEventCustomer, eachEventIntent,
  recordedDonationCentsOf,
} from '@/lib/stripeRegistration';
import { COMP_SOURCE } from '@/lib/compRegistration';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Where daily and weekly bars stop being readable.
 *
 * The sparkline is 240px wide however long the event has been running, so the
 * bars can't keep getting thinner — past each limit the buckets widen a step
 * instead. Daily bars cover the first six weeks, weekly bars the first nine
 * months, and anything older is drawn by month.
 */
const MAX_DAY_BUCKETS = 45;
const MAX_WEEK_BUCKETS = 40;

export type SeriesUnit = 'day' | 'week' | 'month';

/**
 * A sparkline's data: one value per calendar bucket, oldest first, running
 * from the first thing that ever happened to today. All three series share a
 * unit and the same bucket starts, so the charts stack up as one timeline
 * instead of three unrelated ones.
 */
export interface Series {
  values: number[];
  /** Start of each bucket, in ms. Parallel to `values`. */
  startsMs: number[];
  unit: SeriesUnit;
}

export interface SeriesEvent {
  ms: number;
  /** 1 for a headcount, an amount in cents for money. */
  value: number;
}

export interface PersonRow {
  name: string;
  email: string;
  at: string | null;
  /**
   * What this registration donated, in cents. Null when the record predates
   * the field, and absent entirely on a waitlist row — nobody on the waitlist
   * has paid anything yet.
   */
  amountCents?: number | null;
  /** A sponsor-covered entry: it paid nothing by design, not by accident. */
  covered?: boolean;
}

export interface AdminStats {
  /** `people` is every row, newest first — the UI decides how many to show. */
  waitlist: { total: number; newThisWeek: number; people: PersonRow[]; series: Series };
  registrations: {
    total: number;
    athletes: number;
    newThisWeek: number;
    tenK: number;
    funRun: number;
    covered: number;
    people: PersonRow[];
    series: Series;
  };
  money: {
    totalCents: number;
    thisWeekCents: number;
    payingRegistrations: number;
    series: Series;
  };
}

function startOfDay(ms: number): Date {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Daily bars while the event is young, then weekly, then monthly. */
function chooseUnit(earliest: number, now: number): SeriesUnit {
  const days = Math.floor((now - earliest) / DAY_MS) + 1;
  if (days <= MAX_DAY_BUCKETS) return 'day';
  if (days <= MAX_WEEK_BUCKETS * 7) return 'week';
  return 'month';
}

/**
 * Every bucket start from the earliest event to today.
 *
 * Stepping with setDate/setMonth rather than adding a fixed number of
 * milliseconds keeps the buckets on calendar boundaries: 24h steps drift an
 * hour across a daylight-saving change and start filing events into the
 * neighbouring bar.
 */
function bucketStarts(earliest: number, now: number, unit: SeriesUnit): number[] {
  const cursor = startOfDay(earliest);
  if (unit === 'week') cursor.setDate(cursor.getDate() - cursor.getDay());
  if (unit === 'month') cursor.setDate(1);

  const starts: number[] = [];
  while (cursor.getTime() <= now) {
    starts.push(cursor.getTime());
    if (unit === 'month') cursor.setMonth(cursor.getMonth() + 1);
    else cursor.setDate(cursor.getDate() + (unit === 'week' ? 7 : 1));
  }
  return starts;
}

/**
 * One Series per group of events, all sharing a single set of buckets.
 *
 * Shared on purpose: the three sparklines sit in a row, and bars that line up
 * only mean something if they cover the same stretch of time. The buckets run
 * from the earliest event in any group — with nothing at all, from today, so
 * the charts draw an honest zero instead of an empty box.
 */
export function buildSeriesSet(groups: SeriesEvent[][], now: number): Series[] {
  let earliest = now;
  for (const group of groups) {
    for (const event of group) if (event.ms < earliest) earliest = event.ms;
  }

  const unit = chooseUnit(earliest, now);
  const startsMs = bucketStarts(earliest, now, unit);

  return groups.map((group) => {
    const values = new Array<number>(startsMs.length).fill(0);
    for (const event of group) {
      const index = bucketIndex(startsMs, event.ms);
      if (index >= 0) values[index] += event.value;
    }
    return { values, startsMs, unit };
  });
}

/** The bucket a timestamp belongs to, or -1 if it predates the first one. */
function bucketIndex(starts: number[], ms: number): number {
  let lo = 0;
  let hi = starts.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (starts[mid] <= ms) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
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

  // Events are collected first and bucketed afterwards: the chart starts at
  // the first thing that ever happened, and that isn't known until the last
  // customer and the last payment have been read.
  const waitlistEvents: SeriesEvent[] = [];
  const registrationEvents: SeriesEvent[] = [];
  const paymentEvents: SeriesEvent[] = [];

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
      const isCovered = meta.source === COMP_SOURCE;
      registrations.push({
        ...toRow(customer, meta.registeredAt),
        amountCents: recordedDonationCentsOf(customer),
        covered: isCovered,
      });
      const registeredMs = parseDate(meta.registeredAt);
      if ((registeredMs ?? 0) >= cutoff) registrationsNew++;
      if (registeredMs !== null) registrationEvents.push({ ms: registeredMs, value: 1 });

      athletes += athleteCountOf(customer);

      if (meta.raceType === 'fun-run') funRun++;
      else if (meta.raceType === '10k') tenK++;
      if (isCovered) covered++;
      return;
    }

    if (meta.source === WAITLIST_SOURCE) {
      waitlist.push(toRow(customer, meta.submittedAt));
      const joinedMs = parseDate(meta.submittedAt);
      if ((joinedMs ?? 0) >= cutoff) waitlistNew++;
      if (joinedMs !== null) waitlistEvents.push({ ms: joinedMs, value: 1 });
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
    paymentEvents.push({ ms: paidMs, value: amount });
  });

  await Promise.all([customerPass, intentPass]);

  waitlist.sort(byNewest);
  registrations.sort(byNewest);

  const [waitlistSeries, registrationSeries, moneySeries] = buildSeriesSet(
    [waitlistEvents, registrationEvents, paymentEvents],
    now,
  );

  return {
    waitlist: {
      total: waitlist.length,
      newThisWeek: waitlistNew,
      people: waitlist,
      series: waitlistSeries,
    },
    registrations: {
      total: registrations.length,
      athletes,
      newThisWeek: registrationsNew,
      tenK,
      funRun,
      covered,
      people: registrations,
      series: registrationSeries,
    },
    money: { totalCents, thisWeekCents, payingRegistrations, series: moneySeries },
  };
}
