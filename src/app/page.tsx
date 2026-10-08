import Link from 'next/link';
import {
  EVENT_NAME, EVENT_DATE_DISPLAY, EVENT_DATE_ISO,
  CHARITY_NAME, RECOMMENDED_DONATION_AMOUNT, RECOMMENDED_DONATION_5K,
  RECOMMENDED_DONATION_FUN_RUN,
  TEN_K_LABEL, FIVE_K_LABEL, FUN_RUN_LABEL,
  EVENT_LOCATION_NAME, EVENT_CITY, EVENT_STREET_ADDRESS, EVENT_ZIP,
  TEN_K_START_TIME, FIVE_K_START_TIME, FUN_RUN_START_TIME,
  ORG_NAME, ORG_EIN, SITE_URL, REGISTRATION_OPEN,
  RUNNER_MILESTONES, SHOW_RUNNER_COUNT_FROM, IMPACT_HEADLINE, IMPACT_FAMILIES,
  IMPACT_SPONSOR_LINE, GIVE_WHAT_YOU_CAN, MIN_DONATION_DOLLARS,
} from '@/config/site';
import Image from 'next/image';
import { Countdown } from '@/components/ui/Countdown';
import { SponsorMarquee } from '@/components/ui/SponsorMarquee';
import { getRunnerTotal } from '@/lib/getRunnerTotal';
import { RegistrationTeaser } from '@/components/ui/RegistrationTeaser';
import { ReferralAnnouncement } from '@/components/ui/ReferralReward';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Race Against Cancers 2026 — 10K, 5K & 1-Mile Walk',
};

export const revalidate = 300; // refresh every 5 minutes


const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: EVENT_NAME,
  description: `A 10K, 5K & 1-Mile Walk charity race benefiting ${CHARITY_NAME}, run as loops of ${EVENT_LOCATION_NAME} in ${EVENT_CITY} on ${EVENT_DATE_DISPLAY}.`,
  startDate: EVENT_DATE_ISO,
  endDate: '2026-11-07T12:00:00-07:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: `${EVENT_LOCATION_NAME}, ${EVENT_CITY}`,
    address: {
      '@type': 'PostalAddress',
      ...(EVENT_STREET_ADDRESS ? { streetAddress: EVENT_STREET_ADDRESS } : {}),
      addressLocality: 'Alpine',
      addressRegion: 'UT',
      postalCode: EVENT_ZIP,
      addressCountry: 'US',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: ORG_NAME,
    url: SITE_URL,
  },
  // Every entry, so search results don't quote only the 10K number. There is
  // no minimum donation, so these are the recommended amounts — schema.org has
  // no "suggested donation" field, and quoting the recommendation is closer to
  // the truth than quoting 0.
  offers: [
    {
      '@type': 'Offer',
      name: TEN_K_LABEL,
      description: `Suggested donation. Any donation of $${MIN_DONATION_DOLLARS} or more registers.`,
      price: String(RECOMMENDED_DONATION_AMOUNT),
      priceCurrency: 'USD',
      url: `${SITE_URL}/register`,
      availability: 'https://schema.org/InStock',
      validFrom: '2026-01-01',
    },
    {
      '@type': 'Offer',
      name: FIVE_K_LABEL,
      description: `Suggested donation. Any donation of $${MIN_DONATION_DOLLARS} or more registers.`,
      price: String(RECOMMENDED_DONATION_5K),
      priceCurrency: 'USD',
      url: `${SITE_URL}/register`,
      availability: 'https://schema.org/InStock',
      validFrom: '2026-01-01',
    },
    {
      '@type': 'Offer',
      name: FUN_RUN_LABEL,
      description: `Suggested donation. Any donation of $${MIN_DONATION_DOLLARS} or more registers.`,
      price: String(RECOMMENDED_DONATION_FUN_RUN),
      priceCurrency: 'USD',
      url: `${SITE_URL}/register`,
      availability: 'https://schema.org/InStock',
      validFrom: '2026-01-01',
    },
  ],
};

// Keeps "1-Mile Walk" from breaking at its hyphen.
function Nowrap({ children }: { children: React.ReactNode }) {
  return <span className="whitespace-nowrap">{children}</span>;
}

export default async function HomePage() {
  const runners = await getRunnerTotal();
  const milestone =
    RUNNER_MILESTONES.find((m) => m > runners) ?? RUNNER_MILESTONES[RUNNER_MILESTONES.length - 1];
  const showCount = runners >= SHOW_RUNNER_COUNT_FROM;
  const pct = Math.min(Math.round((runners / milestone) * 100), 100);
  const cta = REGISTRATION_OPEN ? 'Register' : 'Join the Waitlist';

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
            <span className="section-label">{EVENT_DATE_DISPLAY} · {EVENT_LOCATION_NAME}, {EVENT_CITY}</span>
            <div className="h-px flex-1 bg-petal" aria-hidden="true" />
          </div>

          <h1 className="font-display text-[clamp(52px,10vw,132px)] uppercase leading-[0.92] tracking-[0.01em] text-ink">
            MILES MEAN{' '}
            <em className="not-italic text-pink">MORE HERE</em>
          </h1>

          <p className="mt-6 max-w-3xl font-body text-xl font-semibold leading-snug text-ink md:text-2xl">
            A community run supporting local families facing cancer.
          </p>

          <div className="mt-4 grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,460px)]">
            <div>
              <p className="max-w-xl font-body text-base leading-relaxed text-ash">
                {IMPACT_HEADLINE} for local patients at {CHARITY_NAME}
              </p>

              <div className="mt-10">
                <Link href="/register" className="btn-primary px-10 py-5 text-base">{cta}</Link>
                <RegistrationTeaser className="mt-4 max-w-md" />
              </div>
            </div>

            <div className="rounded-card bg-blush p-6">
              <p className="section-label mb-4 text-center">Race starts in</p>
              <Countdown target={EVENT_DATE_ISO} />
              <p className="mt-4 text-center font-body text-xs text-ash">
                10K {TEN_K_START_TIME} · 5K {FIVE_K_START_TIME} · 1-Mile Walk {FUN_RUN_START_TIME}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITING */}
      <section className="border-y border-line bg-paper py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-center sm:gap-8 sm:text-left">
          <span className="section-label">Benefiting</span>
          <a href="/about" aria-label={`About ${CHARITY_NAME}`}>
            <Image
              src="/images/intermountain-health-logo.svg"
              alt="Intermountain Health"
              width={220}
              height={67}
              className="object-contain"
              unoptimized
            />
          </a>
          <span className="font-body text-sm text-ash">{CHARITY_NAME}</span>
        </div>
      </section>

      <SponsorMarquee />

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
                body: <>Run the 10K or the 5K, or bring the family for the <Nowrap>1-Mile Walk</Nowrap>. Every race is loops of {EVENT_LOCATION_NAME}, so family and friends can cheer you on every lap.</>,
                // These are suggested donations, not entry fees — the list and
                // the line under it say so.
                extra: (
                  <>
                    <ul className="mt-5 divide-y divide-line border-y border-line font-body text-sm">
                      {[
                        { race: TEN_K_LABEL,   amount: RECOMMENDED_DONATION_AMOUNT },
                        { race: FIVE_K_LABEL,  amount: RECOMMENDED_DONATION_5K },
                        { race: FUN_RUN_LABEL, amount: RECOMMENDED_DONATION_FUN_RUN },
                      ].map((r) => (
                        <li key={r.race} className="py-2">
                          <span className="block font-semibold text-ink">{r.race}</span>
                          <span className="block text-ash">${r.amount} suggested donation</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 font-body text-sm font-semibold text-ink">{GIVE_WHAT_YOU_CAN}</p>
                  </>
                ),
              },
              {
                step: '02',
                heading: 'Pick your color',
                body: `Every entry comes with a race bib and a bandana in the color of the cancer you're running for — breast cancer pink, childhood cancer gold, and more. Run for someone you love.`,
              },
              {
                step: '03',
                heading: 'Show up November 7',
                body: <>10K at {TEN_K_START_TIME}, 5K at {FIVE_K_START_TIME}, <Nowrap>1-Mile Walk</Nowrap> at {FUN_RUN_START_TIME}. Check in 30 minutes before your race at {EVENT_LOCATION_NAME}.</>,
              },
            ].map((item: { step: string; heading: string; body: React.ReactNode; extra?: React.ReactNode }) => (
              <div key={item.step} className="rounded-card border border-petal bg-paper p-8">
                <div className="mb-4 font-display text-4xl text-petal" aria-hidden="true">{item.step}</div>
                <h2 className="mb-3 font-display text-xl uppercase text-ink">{item.heading}</h2>
                <p className="font-body text-sm leading-relaxed text-ash">{item.body}</p>
                {item.extra}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/register" className="btn-primary">{cta}</Link>
          </div>
        </div>
      </section>

      {/* REFERRAL — a slim note, continuing the blush band */}
      <div className="bg-blush pb-14">
        <div className="mx-auto max-w-7xl px-6">
          <ReferralAnnouncement />
        </div>
      </div>

      {/* WHERE THE MONEY GOES */}
      <section className="bg-mist py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="section-label mb-6">Where your donation goes</p>
          <p className="font-display text-[clamp(72px,16vw,160px)] uppercase leading-none text-pink">100%</p>
          <p className="mt-4 font-display text-[clamp(28px,4vw,44px)] uppercase leading-tight text-ink">
            of every donation funds cancer treatment
          </p>
          <p className="mx-auto mt-6 max-w-2xl font-body text-base leading-relaxed text-ink">
            {IMPACT_SPONSOR_LINE}
          </p>
          <p className="mx-auto mt-3 max-w-2xl font-body text-base leading-relaxed text-ash">
            This year, that&rsquo;s {IMPACT_FAMILIES === 3 ? 'three' : IMPACT_FAMILIES} local
            families fighting cancer right now.
          </p>
          <p className="mx-auto mt-6 max-w-2xl font-body text-sm text-ash">
            {ORG_NAME} is a 501(c)(3) nonprofit (EIN {ORG_EIN}). Your registration donation is
            tax-deductible to the extent allowed by law.
          </p>
        </div>
      </section>

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
              { dt: 'Events',   dd: `${TEN_K_LABEL} · ${FIVE_K_LABEL} · ${FUN_RUN_LABEL}` },
              { dt: 'Date',     dd: EVENT_DATE_DISPLAY },
              { dt: 'Start times', dd: `10K ${TEN_K_START_TIME} · 5K ${FIVE_K_START_TIME} · 1-Mile Walk ${FUN_RUN_START_TIME}` },
              { dt: 'Where',    dd: `${EVENT_LOCATION_NAME}, ${EVENT_CITY}` },
            ].map((fact) => (
              <div key={fact.dt} className="rounded-card border border-line p-6">
                <dt className="section-label mb-2">{fact.dt}</dt>
                <dd className="font-display text-2xl uppercase text-ink">{fact.dd}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 text-center">
            <Link href="/race-details" className="btn-ghost">Full race details</Link>
          </div>
        </div>
      </section>

      {/* NEXT MILESTONE */}
      <section className="bg-blush py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-6">Our next milestone</p>
          <p className="font-display text-[clamp(64px,12vw,120px)] uppercase leading-none text-ink">
            {milestone.toLocaleString()} Runners
          </p>
          <p className="mx-auto mt-6 max-w-lg font-body text-base text-ash">
            {showCount
              ? 'Every registration gets us closer. Every person who shows up matters.'
              : `Be one of the first ${milestone.toLocaleString()} on the start line — and bring someone with you.`}
          </p>

          {showCount && (
            <div className="mx-auto mt-10 max-w-xl">
              <div className="mb-3 flex items-end justify-between">
                <span className="font-display text-3xl uppercase text-ink">
                  {runners.toLocaleString()} registered
                </span>
                <span className="font-body text-sm text-ash">{milestone - runners} to go</span>
              </div>
              <div
                className="h-4 w-full overflow-hidden rounded-pill bg-petal"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${pct}% of the way to ${milestone.toLocaleString()} runners`}
              >
                <div className="h-full rounded-pill bg-pink transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <div className="mt-10">
            <Link href="/register" className="btn-primary px-10 py-5 text-base">{cta}</Link>
            <RegistrationTeaser className="mt-4" />
          </div>
        </div>
      </section>
    </>
  );
}
