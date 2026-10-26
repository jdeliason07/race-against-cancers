import { Suspense } from 'react';
import Link from 'next/link';
import {
  BENEFICIARY_BANDANA,
  BENEFICIARY_FIRST_NAME,
  CONTACT_EMAIL,
  NONPROFIT_PARTNERS,
  PARTNER_SHARE_PERCENT,
  PARTNERS_ENABLED,
  REFERRAL_ENABLED,
  REFERRAL_MIN_DONATION_DOLLARS,
  REFERRAL_REWARD,
  REFERRAL_REWARD_VALUE_CENTS,
  REGISTRATION_OPEN,
  SITE_URL,
} from '@/config/site';
import { getStripe } from '@/lib/stripeRegistration';
import { partnerSlug } from '@/lib/partner';
import { buildAdminStats, type AdminStats } from '@/lib/adminStats';
import { buildReferralReport } from '@/lib/referralReport';
import { isSenderConfigured, listCampaigns } from '@/lib/senderNet';
import { SwipeDeck } from './SwipeDeck';
import { PeopleList } from './PeopleList';
import { money, exactMoney, when } from './format';
import { PaneHeader } from './PaneHeader';
import { Sparkline } from './Sparkline';
import { EmailComposer } from './EmailComposer';

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

/**
 * Where the total came from.
 *
 * A gift that arrives outside the registration form — a sponsor's invoice, a
 * Payment Link — used to be missing from this number altogether. It is named
 * here rather than folded in silently, so the next one is visible as itself.
 */
function raisedSub(money_: AdminStats['money']): string {
  const parts: string[] = [];
  if (money_.otherCents > 0) parts.push(`${money(money_.otherCents)} direct`);
  parts.push(`${money(money_.registrationCents)} registrations`);
  if (money_.refundedCents > 0) parts.push(`${money(money_.refundedCents)} refunded`);
  parts.push(`${money(money_.thisWeekCents)} this week`);
  return parts.join(' · ');
}

/** A partner's cut of the donations credited to it, in cents. */
function partnerShareCents(donationCents: number): number {
  return Math.round((donationCents * PARTNER_SHARE_PERCENT) / 100);
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
            <Sparkline series={stats.waitlist.series} label="signups" />
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
          <Sparkline series={stats.registrations.series} label="registrations" />
        </Stat>

        <Stat
          label="Raised"
          value={money(stats.money.totalCents)}
          sub={raisedSub(stats.money)}
        >
          <Sparkline series={stats.money.series} format={money} label="raised" />
        </Stat>

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
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="10K" value={stats.registrations.tenK.toLocaleString()} />
          <Stat label="5K" value={stats.registrations.fiveK.toLocaleString()} />
          <Stat label="1-Mile Walk" value={stats.registrations.funRun.toLocaleString()} />
          <Stat
            label="Covered entries"
            value={stats.registrations.covered.toLocaleString()}
            sub="claimed via invite link"
          />
        </div>
      )}

      {stats.registrations.total > 0 && (
        <Panel title="Bandanas">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.registrations.bandanas.map((bandana) => (
              <li
                key={bandana.label}
                className="flex items-center gap-3 rounded-card border border-line p-4"
              >
                <span
                  aria-hidden="true"
                  className="h-8 w-8 shrink-0 rounded-full border border-line"
                  style={{ backgroundColor: bandana.color ?? 'transparent' }}
                />
                <div className="min-w-0">
                  <p className="font-display text-2xl leading-none text-ink">
                    {bandana.athletes.toLocaleString()}
                  </p>
                  <p className="mt-1 font-body text-xs text-ash">
                    {bandana.label}
                    {bandana.label === BENEFICIARY_BANDANA && ` · for ${BENEFICIARY_FIRST_NAME}`}
                    {bandana.color === null && ' · no longer offered'}
                  </p>
                  {bandana.registrations !== bandana.athletes && (
                    <p className="font-body text-xs text-ash">
                      across {bandana.registrations}{' '}
                      {bandana.registrations === 1 ? 'registration' : 'registrations'}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 font-body text-xs text-ash">
            One bandana per athlete: a group registration picks one color for all of its athletes.
            Covered entries are included; registrations refunded in full are not.
          </p>
        </Panel>
      )}

      {PARTNERS_ENABLED && (
        <Panel title="Nonprofit partners">
          {/* The link to hand each partner: it fills their name into the box
              for anyone who follows it. Shown first — before anyone has
              registered, this is the only thing in the panel worth having. */}
          <ul className="mb-4 space-y-2">
            {NONPROFIT_PARTNERS.map((partner) => {
              const link = `${SITE_URL}/register?partner=${partnerSlug(partner.name)}`;
              return (
                <li key={partner.name} className="rounded-card border border-line bg-mist px-4 py-3">
                  <p className="font-body text-xs font-bold uppercase tracking-widest text-ash">
                    {partner.name}&rsquo;s link
                  </p>
                  <a
                    href={link}
                    className="mt-1 block break-all font-body text-sm text-pink underline underline-offset-2"
                  >
                    {link}
                  </a>
                </li>
              );
            })}
          </ul>
          {stats.partners.rows.length > 0 ? (
            <>
              <p className="mb-4 font-body text-sm text-ash">
                <span className="mr-2 font-display text-3xl leading-none text-ink">
                  {stats.partners.registrations.toLocaleString()}
                </span>
                paid {stats.partners.registrations === 1 ? 'registration' : 'registrations'} named
                a partner, donating {exactMoney(stats.partners.donationCents)} —{' '}
                <span className="font-bold text-ink">
                  {exactMoney(partnerShareCents(stats.partners.donationCents))}
                </span>{' '}
                is the partners&rsquo; {PARTNER_SHARE_PERCENT}%.
              </p>
              <ul className="divide-y divide-line rounded-card border border-line">
                {stats.partners.rows.map((row) => (
                  <li key={row.name} className="px-4 py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="font-body text-sm font-bold text-ink">{row.name}</span>
                      <span className="font-body text-xs text-ash">
                        {row.registrations} {row.registrations === 1 ? 'registration' : 'registrations'}
                        {row.athletes !== row.registrations && ` · ${row.athletes} athletes`} ·{' '}
                        {exactMoney(row.donationCents)} donated ·{' '}
                        <span className="font-bold text-pink">
                          {exactMoney(partnerShareCents(row.donationCents))} their{' '}
                          {PARTNER_SHARE_PERCENT}%
                        </span>
                      </span>
                    </div>
                    {/* Who, for checking the list with the partner before
                        settling up. Collapsed: it can run to hundreds. */}
                    <details className="mt-2">
                      <summary className="cursor-pointer font-body text-xs text-pink">
                        Who named them
                      </summary>
                      <ul className="mt-2 space-y-1 border-l-2 border-line pl-3">
                        {row.supporters.map((supporter, i) => (
                          <li
                            key={`${supporter.name}-${i}`}
                            className="flex items-baseline justify-between gap-3 font-body text-xs text-ash"
                          >
                            <span className="min-w-0 truncate">
                              {supporter.name}
                              {supporter.athletes > 1 && ` × ${supporter.athletes}`}
                            </span>
                            <span className="shrink-0">{exactMoney(supporter.donationCents)}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-body text-xs text-ash">
                Typed by registrants and not verified. An answer containing a listed partner&rsquo;s
                name counts for that partner; anything else is shown as typed. Donations are net of
                refunds and leave out the card fee.
              </p>
            </>
          ) : (
            <p className="font-body text-sm text-ash">
              No paid registration has named a partner yet. Answers to the &ldquo;Nonprofit
              partner&rdquo; box on the registration form show up here once that registration is
              paid.
            </p>
          )}
        </Panel>
      )}

      {!REGISTRATION_OPEN && (
        <Panel title="Waitlist signups">
          <PeopleList rows={stats.waitlist.people} empty="Nobody on the waitlist yet." />
        </Panel>
      )}

      {stats.registrations.total > 0 && (
        <Panel title="Registrations">
          <PeopleList rows={stats.registrations.people} empty="No registrations yet." />
        </Panel>
      )}

      <Panel title={`Notes for ${BENEFICIARY_FIRST_NAME}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line p-5">
          <p className="font-body text-sm text-ash">
            <span className="mr-2 font-display text-3xl leading-none text-ink">
              {stats.registrations.notes.toLocaleString()}
            </span>
            {stats.registrations.notes === 1 ? 'note' : 'notes'} written on the registration form,
            ready to read through and print as a book.
          </p>
          <Link href="/admin/notes" className="btn-ghost px-5 py-3">
            Open the book
          </Link>
        </div>
      </Panel>

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
