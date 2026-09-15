import Link from 'next/link';
import {
  EVENT_NAME, EVENT_DATE_DISPLAY, EVENT_DATE_ISO,
  CHARITY_NAME, RECOMMENDED_DONATION_AMOUNT, RECOMMENDED_DONATION_FUN_RUN,
  TEN_K_LABEL, FUN_RUN_LABEL,
  EVENT_LOCATION_NAME, FUN_RUN_LOCATION_NAME,
  ORG_NAME, SITE_URL, REGISTRATION_OPEN,
} from '@/config/site';
import { getDonationTotal } from '@/lib/getDonationTotal';
import { RegistrationTeaser } from '@/components/ui/RegistrationTeaser';
import { ReferralAnnouncement } from '@/components/ui/ReferralReward';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Race Against Cancers 2026 — 10K & Fun Run',
};

export const revalidate = 300; // refresh every 5 minutes

const GOAL = 500000;

const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: EVENT_NAME,
  description: `A 10K & Fun Run charity race benefiting ${CHARITY_NAME}. Run through Provo, Utah on ${EVENT_DATE_DISPLAY}.`,
  startDate: EVENT_DATE_ISO,
  endDate: '2026-11-07T12:00:00-07:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'University Ave & Center St',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'University Ave & Center St',
      addressLocality: 'Provo',
      addressRegion: 'UT',
      postalCode: '84601',
      addressCountry: 'US',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: ORG_NAME,
    url: SITE_URL,
  },
  // Both entries, so search results don't quote only the 10K number. There is
  // no minimum donation, so these are the recommended amounts — schema.org has
  // no "suggested donation" field, and quoting the recommendation is closer to
  // the truth than quoting 0.
  offers: [
    {
      '@type': 'Offer',
      name: TEN_K_LABEL,
      price: String(RECOMMENDED_DONATION_AMOUNT),
      priceCurrency: 'USD',
      url: `${SITE_URL}/register`,
      availability: 'https://schema.org/InStock',
      validFrom: '2026-01-01',
    },
    {
      '@type': 'Offer',
      name: FUN_RUN_LABEL,
      price: String(RECOMMENDED_DONATION_FUN_RUN),
      priceCurrency: 'USD',
      url: `${SITE_URL}/register`,
      availability: 'https://schema.org/InStock',
      validFrom: '2026-01-01',
    },
  ],
};

export default async function HomePage() {
  const raised = await getDonationTotal();
  const pct = Math.min(Math.round((raised / GOAL) * 100), 100);
  return (
    <>
      {/* JSON-LD Event Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      {/* HERO */}
      <section className="bg-paper pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rule-line mb-8">
            <div className="h-px flex-1 bg-petal" aria-hidden="true" />
            <span className="section-label">{EVENT_DATE_DISPLAY}</span>
            <div className="h-px flex-1 bg-petal" aria-hidden="true" />
          </div>

          <h1 className="font-display text-[clamp(52px,10vw,132px)] uppercase leading-[0.92] tracking-[0.01em] text-ink">
            RUN. GIVE.{' '}
            <em className="not-italic text-pink">CHANGE LIVES.</em>
          </h1>

          <p className="mt-8 max-w-xl font-body text-lg text-ash">
            A 10K & Fun Run benefiting {CHARITY_NAME}. Your registration
            is a donation to the cause — we recommend ${RECOMMENDED_DONATION_AMOUNT} for the 10K
            and ${RECOMMENDED_DONATION_FUN_RUN} for the family Fun Run, with no minimum.
          </p>

          <div className="mt-10">
            <Link href="/register" className="btn-primary px-10 py-5 text-base">
              {REGISTRATION_OPEN ? 'Register' : 'Join the Waitlist'}
            </Link>
            <RegistrationTeaser className="mt-4 max-w-md" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-blush py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rule-line mb-10">
            <div className="h-px flex-1 bg-petal" aria-hidden="true" />
            <span className="section-label">How it works</span>
            <div className="h-px flex-1 bg-petal" aria-hidden="true" />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '01',
                heading: 'Choose your distance',
                body: `Run the ${TEN_K_LABEL} through Provo — $${RECOMMENDED_DONATION_AMOUNT} recommended — or bring the family for the ${FUN_RUN_LABEL} from LaVell Edwards Stadium to downtown, $${RECOMMENDED_DONATION_FUN_RUN} recommended and short enough for kids to finish.`,
              },
              {
                step: '02',
                heading: 'Register to give',
                body: `Your registration fee is a donation to ${CHARITY_NAME}. Give as much as you're willing.`,
              },
              {
                step: '03',
                heading: 'Show up November 7',
                body: `Race day is ${EVENT_DATE_DISPLAY}. Lace up, show up, and run for something real.`,
              },
            ].map((item) => (
              <div key={item.step} className="rounded-card border border-petal bg-paper p-8">
                <div className="mb-4 font-display text-4xl text-petal">{item.step}</div>
                <h2 className="mb-3 font-display text-xl uppercase text-ink">{item.heading}</h2>
                <p className="font-body text-sm leading-relaxed text-ash">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/register" className="btn-primary">{REGISTRATION_OPEN ? 'Register' : 'Join the Waitlist'}</Link>
          </div>
        </div>
      </section>

      {/* REFERRAL INCENTIVE — continues the blush band under "How it works" */}
      <div className="bg-blush pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <ReferralAnnouncement />
        </div>
      </div>

      {/* EVENT FACTS */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rule-line mb-12">
            <div className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className="section-label">The Race</span>
            <div className="h-px flex-1 bg-line" aria-hidden="true" />
          </div>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { dt: 'Events',   dd: `${TEN_K_LABEL} + ${FUN_RUN_LABEL}` },
              { dt: 'Date',     dd: EVENT_DATE_DISPLAY },
              { dt: 'Start',    dd: `10K: ${EVENT_LOCATION_NAME} · Fun Run: ${FUN_RUN_LOCATION_NAME}` },
              { dt: 'Entry',    dd: `10K $${RECOMMENDED_DONATION_AMOUNT} · Fun Run $${RECOMMENDED_DONATION_FUN_RUN} suggested` },
            ].map((fact) => (
              <div key={fact.dt} className="rounded-card border border-line p-6">
                <dt className="section-label mb-2">{fact.dt}</dt>
                <dd className="font-display text-2xl uppercase text-ink">{fact.dd}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* GOAL + PROGRESS */}
      <section className="bg-blush py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-6">Our goal</p>
          <p className="font-display text-[clamp(64px,12vw,120px)] uppercase leading-none text-ink">
            $500,000
          </p>
          <p className="mt-6 max-w-lg mx-auto font-body text-base text-ash">
            That&rsquo;s what we&rsquo;re raising for the cause. Every registration gets us closer.
            Every dollar counts. Every person who shows up matters.
          </p>

          {/* Progress bar */}
          <div className="mt-10 max-w-xl mx-auto">
            <div className="mb-3 flex items-end justify-between">
              <span className="font-display text-3xl uppercase text-ink">
                ${raised.toLocaleString()}
              </span>
              <span className="font-body text-sm text-ash">{pct}% of goal</span>
            </div>
            <div
              className="h-4 w-full rounded-pill bg-petal overflow-hidden"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${pct}% of $500,000 goal raised`}
            >
              <div
                className="h-full rounded-pill bg-pink transition-all duration-700"
                style={{ width: `${pct === 0 ? 1 : pct}%` }}
              />
            </div>
            <div className="mt-2 text-right">
              <span className="font-body text-xs text-ash">Goal: $500,000</span>
            </div>
          </div>

          <div className="mt-10">
            <Link href="/register" className="btn-primary px-10 py-5 text-base">
              {REGISTRATION_OPEN ? 'Register' : 'Join the Waitlist'}
            </Link>
            <RegistrationTeaser className="mt-4" />
          </div>
        </div>
      </section>
    </>
  );
}
