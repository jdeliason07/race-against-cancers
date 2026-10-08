import {
  EVENT_NAME, EVENT_DATE_DISPLAY, EVENT_DATE_ISO,
  TEN_K_START_TIME, FIVE_K_START_TIME, FUN_RUN_START_TIME,
  TEN_K_CHECK_IN_TIME, FIVE_K_CHECK_IN_TIME, FUN_RUN_CHECK_IN_TIME,
  EVENT_LOCATION_NAME, EVENT_LOCATION_ADDRESS, EVENT_CITY, EVENT_STREET_ADDRESS, EVENT_ZIP, EVENT_MAPS_URL,
  CHECK_IN_NOTE, COURSE_GPX_URL, SITE_URL, ORG_NAME, REGISTRATION_OPEN,
  TEN_K_LABEL, FIVE_K_LABEL, FUN_RUN_LABEL,
  RECOMMENDED_DONATION_AMOUNT, RECOMMENDED_DONATION_5K, RECOMMENDED_DONATION_FUN_RUN,
} from '@/config/site';
import { MapPin, Clock, Package, Download, Heart } from 'lucide-react';
import Link from 'next/link';
import { RegistrationTeaser } from '@/components/ui/RegistrationTeaser';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Race Details',
  description: `Start times, check-in, and course info for Race Against Cancers 2026 at ${EVENT_LOCATION_NAME}, ${EVENT_CITY} on ${EVENT_DATE_DISPLAY}.`,
};

const courseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: EVENT_NAME,
  startDate: EVENT_DATE_ISO,
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
  organizer: { '@type': 'Organization', name: ORG_NAME },
  url: `${SITE_URL}/race-details`,
};

const schedule = [
  { race: TEN_K_LABEL,   checkIn: TEN_K_CHECK_IN_TIME,   start: TEN_K_START_TIME,   donation: RECOMMENDED_DONATION_AMOUNT },
  { race: FIVE_K_LABEL,  checkIn: FIVE_K_CHECK_IN_TIME,  start: FIVE_K_START_TIME,  donation: RECOMMENDED_DONATION_5K },
  { race: FUN_RUN_LABEL, checkIn: FUN_RUN_CHECK_IN_TIME, start: FUN_RUN_START_TIME, donation: RECOMMENDED_DONATION_FUN_RUN },
];

export default function RaceDetailsPage() {
  return (
    <div className="bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />

      <section className="bg-mist py-20 border-b border-line">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-4">{EVENT_DATE_DISPLAY}</p>
          <h1 className="font-display text-5xl uppercase text-ink md:text-7xl">Race Details</h1>
          <p className="mt-4 font-body text-base text-ash">
            {EVENT_LOCATION_NAME} · {EVENT_CITY}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-20 space-y-20">

        {/* Race-day schedule */}
        <section>
          <div className="mb-2 flex items-center gap-3">
            <Clock size={22} className="shrink-0 text-pink" aria-hidden="true" />
            <h2 className="font-display text-3xl uppercase text-ink">Race-Day Schedule</h2>
          </div>
          <p className="mb-6 font-body text-sm text-ash">
            {EVENT_DATE_DISPLAY} · {CHECK_IN_NOTE}.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse font-body text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-3 pr-6 text-left text-xs font-bold uppercase tracking-widest text-ash">Race</th>
                  <th className="py-3 pr-6 text-left text-xs font-bold uppercase tracking-widest text-ash">Check in by</th>
                  <th className="py-3 pr-6 text-left text-xs font-bold uppercase tracking-widest text-ash">Start</th>
                  <th className="py-3 text-left text-xs font-bold uppercase tracking-widest text-ash">Recommended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {schedule.map((r) => (
                  <tr key={r.race}>
                    <td className="py-4 pr-6 font-display text-lg uppercase text-ink">{r.race}</td>
                    <td className="py-4 pr-6 font-body text-base text-ink">{r.checkIn}</td>
                    <td className="py-4 pr-6 font-display text-lg text-pink">{r.start}</td>
                    <td className="py-4 font-body text-base text-ash">${r.donation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Logistics summary */}
        <section>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-card border border-line p-6">
              <div className="mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-pink shrink-0" aria-hidden="true" />
                <dt className="section-label">Location — All Races</dt>
              </div>
              <dd className="font-body text-sm text-ink leading-relaxed">
                {EVENT_LOCATION_NAME}<br />
                <span className="text-ash text-xs">{EVENT_STREET_ADDRESS ? EVENT_LOCATION_ADDRESS : EVENT_CITY}</span>
              </dd>
            </div>

            <div className="rounded-card border border-line p-6">
              <div className="mb-2 flex items-center gap-2">
                <Package size={16} className="text-pink shrink-0" aria-hidden="true" />
                <dt className="section-label">What you get</dt>
              </div>
              <dd className="font-body text-sm text-ink leading-relaxed">
                Race bib + a bandana in the color of the cancer you&rsquo;re running for.
                Pick it up at check-in.
              </dd>
            </div>

            <div className="rounded-card border border-line p-6">
              <div className="mb-2 flex items-center gap-2">
                <Heart size={16} className="text-pink shrink-0" aria-hidden="true" />
                <dt className="section-label">Entry Donation</dt>
              </div>
              <dd className="font-body text-sm text-ink leading-relaxed">
                Tax-deductible. Recommended: 10K ${RECOMMENDED_DONATION_AMOUNT} · 5K $
                {RECOMMENDED_DONATION_5K} · Walk ${RECOMMENDED_DONATION_FUN_RUN}.<br />
                <span className="text-ash text-xs">Give more if you&rsquo;re able.</span>
              </dd>
            </div>
          </dl>
        </section>

        {/* The course */}
        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">The Course</h2>
          <div className="space-y-4 font-body text-base leading-relaxed text-ash">
            <p>
              Every race starts, runs, and finishes inside {EVENT_LOCATION_NAME} in {EVENT_CITY},
              run as loops of the park. Start, finish, and check-in are all in one
              place.
            </p>
            <p>
              Because it&rsquo;s a loop, your crowd never has to choose a spot: family and friends
              can stay in one place and cheer you on every lap. The races start in sequence — the
              10K first, then the 5K, then the 1-Mile Walk — so you can run one race and stay to
              cheer for the next.
            </p>
            <p>
              The <span className="font-semibold text-ink">1-Mile Walk</span> is made for families:
              short enough for kids, easy to walk the whole way, and strollers are welcome.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={EVENT_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 text-xs"
            >
              <MapPin size={14} /> Directions to {EVENT_LOCATION_NAME}
            </a>
            {COURSE_GPX_URL ? (
              <a href={COURSE_GPX_URL} download className="btn-ghost inline-flex items-center gap-2 text-xs">
                <Download size={14} /> Download Course GPX
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-pill border border-line px-5 py-3 font-body text-xs font-bold uppercase tracking-widest text-ash opacity-50 cursor-not-allowed">
                Course map coming soon
              </span>
            )}
          </div>
        </section>

        <div className="pt-4">
          <Link href="/register" className="btn-primary">{REGISTRATION_OPEN ? 'Register' : 'Join the Waitlist'}</Link>
          <RegistrationTeaser className="mt-4" />
        </div>
      </div>
    </div>
  );
}
