import { Suspense } from 'react';
import {
  CONTACT_EMAIL,
  REFERRAL_ENABLED,
  REFERRAL_MIN_DONATION_DOLLARS,
  REFERRAL_REWARD,
  REFERRAL_REWARD_VALUE_CENTS,
  REGISTRATION_OPEN,
} from '@/config/site';
import { getStripe } from '@/lib/stripeRegistration';
import { buildAdminStats, SERIES_DAYS, type PersonRow } from '@/lib/adminStats';
import { buildReferralReport } from '@/lib/referralReport';
import { isSenderConfigured, listCampaigns } from '@/lib/senderNet';
import { SwipeDeck } from './SwipeDeck';
import { PaneHeader } from './PaneHeader';
import { Sparkline } from './Sparkline';
import { EmailComposer } from './EmailComposer';

function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

/**
 * Dollars with the cents kept when there are any. money() above rounds, which
 * is right for a fundraising total and wrong for a donation being measured
 * against the referral minimum: it would print $94.99 as "$95" and make a
 * registration that missed the bar look like one that cleared it.
 */
function exactMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function when(value: string | null): string {
  if (!value) return '';
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function pct(part: number, whole: number): string {
  if (!whole) return '—';
  return `${Math.round((part / whole) * 100)}%`;
}

/**
 * The line under the cards-owed number: what the pile costs, and how many
 * referrals missed the donation minimum. The near-misses are named here rather
 * than left out, because "why is this lower than I expected" is the first
 * question the number raises.
 */
function cardsOwedSub(owed: number, belowMinimum: number): string {
  const cost = `${money(owed * REFERRAL_REWARD_VALUE_CENTS)} in ${REFERRAL_REWARD}s`;
  if (belowMinimum === 0) return cost;
  const missed = `${belowMinimum} under $${REFERRAL_MIN_DONATION_DOLLARS} didn't qualify`;
  return `${cost} · ${missed}`;
}

function Stat({
  label,
  value,
  sub,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-line p-5">
      <p className="section-label mb-2">{label}</p>
      <p className="font-display text-3xl uppercase leading-none text-ink">{value}</p>
      {sub && <p className="mt-2 font-body text-xs text-ash">{sub}</p>}
      {children}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-2xl uppercase text-ink">{title}</h2>
      {children}
    </section>
  );
}

function PeopleList({ rows, empty }: { rows: PersonRow[]; empty: string }) {
  if (rows.length === 0) return <p className="font-body text-sm text-ash">{empty}</p>;
  return (
    <ul className="divide-y divide-line rounded-card border border-line">
      {rows.map((row) => (
        <li key={row.email} className="flex items-baseline justify-between gap-4 px-4 py-3">
          <span className="min-w-0 font-body text-sm text-ink">
            <span className="font-bold">{row.name}</span>
            <span className="ml-2 break-all text-ash">{row.email}</span>
          </span>
          <span className="shrink-0 font-body text-xs text-ash">{when(row.at)}</span>
        </li>
      ))}
    </ul>
  );
}

async function StripePanels() {
  const stripe = getStripe();
  if (!stripe) return <p className="font-body text-sm text-ash">Stripe is not configured.</p>;

  let stats;
  // A referral failure shouldn't take the whole dashboard down, but it must
  // not look like "no referrals" either — so the failure is carried as a value
  // alongside the report rather than thrown away.
  let referral;
  try {
    [stats, referral] = await Promise.all([
      buildAdminStats(stripe),
      buildReferralReport(stripe).then(
        (report) => ({ report, error: null as string | null }),
        (err: unknown) => ({
          report: null,
          error: err instanceof Error ? err.message : 'Unknown error',
        }),
      ),
    ]);
  } catch (err) {
    return (
      <p className="rounded-card border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
        Could not load Stripe numbers: {err instanceof Error ? err.message : 'unknown error'}
      </p>
    );
  }

  const window = `Last ${SERIES_DAYS} days`;

  // Everyone who ever reached the card step: the ones who paid, plus the ones
  // who didn't. Covered entries are excluded because they never had a payment
  // to abandon, and counting them would flatter the drop-off rate.
  const startedPaying =
    stats.registrations.total - stats.registrations.covered + stats.incomplete.total;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* The waitlist only exists until registration opens; once it does, it
            stops being a number worth watching. */}
        {!REGISTRATION_OPEN && (
          <Stat
            label="Waitlist"
            value={stats.waitlist.total.toLocaleString()}
            sub={`${stats.waitlist.newThisWeek} joined this week`}
          >
            <Sparkline series={stats.waitlist.series} caption={`${window}, signups per day`} />
          </Stat>
        )}

        <Stat
          label="Registered"
          value={stats.registrations.total.toLocaleString()}
          sub={
            stats.registrations.athletes !== stats.registrations.total
              ? `${stats.registrations.athletes} athletes in total`
              : `${stats.registrations.newThisWeek} this week`
          }
        >
          <Sparkline
            series={stats.registrations.series}
            caption={`${window}, registrations per day`}
          />
        </Stat>

        <Stat
          label="Raised"
          value={money(stats.money.totalCents)}
          sub={`${money(stats.money.thisWeekCents)} this week`}
        >
          <Sparkline
            series={stats.money.series}
            format={(cents) => money(cents)}
            caption={`${window}, raised per day`}
          />
        </Stat>

        {/* The only leak in the funnel you can act on directly: they gave you
            their name and email and stopped at the card. Shown only when there
            are any — a permanent zero is just another number to scroll past. */}
        {stats.incomplete.total > 0 && (
          <Stat
            label="Didn't finish"
            value={stats.incomplete.total.toLocaleString()}
            sub={`${stats.incomplete.newThisWeek} this week · ${pct(
              stats.incomplete.total,
              startedPaying,
            )} of everyone who started`}
          >
            <Sparkline
              series={stats.incomplete.series}
              caption={`${window}, drop-offs per day`}
            />
          </Stat>
        )}

        {/* Sits with the other headline numbers because it is one: what the
            referral program has cost us so far. Hidden rather than shown as a
            zero when the referral load failed — the panel below says why. */}
        {REFERRAL_ENABLED && referral.report && (
          <Stat
            label="Cards owed"
            value={referral.report.allTimeTotal.toLocaleString()}
            sub={cardsOwedSub(referral.report.allTimeTotal, referral.report.belowMinimumTotal)}
          />
        )}
      </div>

      {stats.registrations.total > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Stat label="10K" value={stats.registrations.tenK.toLocaleString()} />
          <Stat label="Fun Run" value={stats.registrations.funRun.toLocaleString()} />
          <Stat
            label="Covered entries"
            value={stats.registrations.covered.toLocaleString()}
            sub="claimed via invite link"
          />
        </div>
      )}

      {!REGISTRATION_OPEN && (
        <Panel title="Newest waitlist signups">
          <PeopleList rows={stats.waitlist.recent} empty="Nobody on the waitlist yet." />
        </Panel>
      )}

      {stats.registrations.total > 0 && (
        <Panel title="Newest registrations">
          <PeopleList rows={stats.registrations.recent} empty="No registrations yet." />
        </Panel>
      )}

      {stats.incomplete.total > 0 && (
        <Panel title="Started but didn't pay">
          <PeopleList rows={stats.incomplete.recent} empty="Nobody has abandoned a registration." />
          <p className="mt-2 font-body text-xs text-ash">
            The newest {Math.min(stats.incomplete.recent.length, stats.incomplete.total)} of{' '}
            {stats.incomplete.total}, dated when they started. Swipe to Email and hit{' '}
            <span className="font-bold">Sync unfinished</span> to put all {stats.incomplete.total}{' '}
            in a Sender group and write to them.
          </p>
        </Panel>
      )}

      {REFERRAL_ENABLED && (
        <Panel title="Referrals">
          {referral.error ? (
            <p className="rounded-card border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
              Could not load referrals: {referral.error}
            </p>
          ) : referral.report && referral.report.rows.length > 0 ? (
            <>
              <ul className="divide-y divide-line rounded-card border border-line">
                {referral.report.rows.slice(0, 8).map((row) => (
                  <li key={row.name} className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-body text-sm font-bold text-ink">{row.name}</span>
                      <span className="shrink-0 font-body text-xs text-ash">
                        {row.newCount} this week · {row.totalCount} owed
                      </span>
                    </div>
                    {/* Every miss, with what they actually gave and the gap —
                        nearest first, because whether to honour a referral that
                        came up a dollar short is a call worth making by hand. */}
                    {row.belowMinimum.length > 0 && (
                      <ul className="mt-2 space-y-1 border-l-2 border-line pl-3">
                        {row.belowMinimum.map((miss) => (
                          <li
                            key={`${miss.name}-${miss.donatedCents}`}
                            className="flex items-baseline justify-between gap-3 font-body text-xs text-ash"
                          >
                            <span className="min-w-0 truncate">{miss.name}</span>
                            <span className="shrink-0">
                              {exactMoney(miss.donatedCents)} ·{' '}
                              <span className="text-pink">
                                {exactMoney(miss.shortCents)} short
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-body text-xs text-ash">
                Names are typed by registrants and aren&rsquo;t verified. A referral earns a{' '}
                {REFERRAL_REWARD} only if that registration donated $
                {REFERRAL_MIN_DONATION_DOLLARS} or more.
              </p>
            </>
          ) : (
            <>
              <p className="font-body text-sm text-ash">
                No referrals recorded yet.{' '}
                {!REGISTRATION_OPEN && 'Nobody can refer anyone until registration opens.'}
              </p>
              <p className="mt-2 font-body text-xs text-ash">
                A referral is recorded when a paid registration names someone in the &ldquo;Who
                referred you?&rdquo; box — so this stays empty until the Stripe webhook is
                delivering <code>payment_intent.succeeded</code>.
              </p>
            </>
          )}
        </Panel>
      )}
    </>
  );
}

async function EmailPanel() {
  if (!isSenderConfigured()) {
    return <p className="font-body text-sm text-ash">SENDER_API_TOKEN is not set.</p>;
  }

  let campaigns;
  try {
    campaigns = await listCampaigns(8);
  } catch (err) {
    return (
      <p className="rounded-card border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
        {err instanceof Error ? err.message : 'Could not load campaigns.'}
      </p>
    );
  }

  const sent = campaigns.filter((c) => c.sent > 0 || c.status === 'SENT');
  if (sent.length === 0) {
    return (
      <p className="font-body text-sm text-ash">
        Nothing sent yet. Swipe across to write your first email.
      </p>
    );
  }

  // Stacked cards rather than a table — a phone shouldn't have to scroll
  // sideways to read a number.
  return (
    <ul className="space-y-3">
      {sent.map((c) => (
        <li key={c.id} className="rounded-card border border-line p-4">
          <p className="font-body text-sm font-bold text-ink">{c.subject || c.title}</p>
          <p className="mt-0.5 font-body text-xs text-ash">
            {c.sentAt ? when(c.sentAt) : c.status} · {c.sent.toLocaleString()} delivered of{' '}
            {c.recipients.toLocaleString()}
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Opens', value: c.opens, rate: pct(c.opens, c.sent) },
              { label: 'Clicks', value: c.clicks, rate: pct(c.clicks, c.sent) },
              { label: 'Bounces', value: c.bounces, rate: pct(c.bounces, c.sent) },
            ].map((cell) => (
              <div key={cell.label} className="rounded-card bg-mist px-3 py-2">
                <dt className="font-body text-[10px] font-bold uppercase tracking-widest text-ash">
                  {cell.label}
                </dt>
                <dd className="font-body text-base font-bold text-ink">
                  {cell.value.toLocaleString()}{' '}
                  <span className="font-normal text-xs text-ash">{cell.rate}</span>
                </dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-card border border-line bg-mist" />
      ))}
    </div>
  );
}

function DashboardPane() {
  return (
    <>
      <PaneHeader title="Dashboard" />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Suspense fallback={<Skeleton />}>
          <StripePanels />
        </Suspense>

        <Panel title="Email campaigns">
          <Suspense
            fallback={<div className="h-24 animate-pulse rounded-card border border-line bg-mist" />}
          >
            <EmailPanel />
          </Suspense>
        </Panel>
      </div>
    </>
  );
}

function EmailPane() {
  return (
    <>
      <PaneHeader title="Email" />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <EmailComposer defaultEmail={CONTACT_EMAIL} />
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <SwipeDeck
      panes={[
        { key: 'Dashboard', node: <DashboardPane /> },
        { key: 'Email', node: <EmailPane /> },
      ]}
    />
  );
}
