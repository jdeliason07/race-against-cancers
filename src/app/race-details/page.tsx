import {
  EVENT_NAME, EVENT_DATE_DISPLAY, TEN_K_START_TIME, FUN_RUN_START_TIME,
  EVENT_LOCATION_NAME, EVENT_LOCATION_ADDRESS, EVENT_DATE_ISO,
  FINISH_LOCATION_NAME, FINISH_LOCATION_ADDRESS,
  FUN_RUN_LOCATION_NAME, FUN_RUN_LOCATION_ADDRESS,
  CHECK_IN_DATE, CHECK_IN_TIME, CHECK_IN_LOCATION,
  COURSE_GPX_URL, SITE_URL, ORG_NAME, REGISTRATION_OPEN,
  RECOMMENDED_DONATION_AMOUNT, RECOMMENDED_DONATION_FUN_RUN,
} from '@/config/site';
import { MapPin, Clock, Package, Download, Flag, Heart } from 'lucide-react';
import Link from 'next/link';
import { CourseMapSection, ElevationChartSection } from '@/components/course/CourseClientSections';
import { RegistrationTeaser } from '@/components/ui/RegistrationTeaser';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Race Details',
  description: `Course info, start times, check-in, and logistics for Race Against Cancers 2026 on ${EVENT_DATE_DISPLAY}.`,
};

const courseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: EVENT_NAME,
  startDate: EVENT_DATE_ISO,
  location: {
    '@type': 'Place',
    name: FINISH_LOCATION_NAME,
    address: {
      '@type': 'PostalAddress',
      streetAddress: FINISH_LOCATION_ADDRESS,
      addressLocality: 'Provo',
      addressRegion: 'UT',
      addressCountry: 'US',
    },
  },
  organizer: { '@type': 'Organization', name: ORG_NAME },
  url: `${SITE_URL}/race-details`,
};

const waves = [
  { wave: 'Wave 1', time: '8:00 AM', pace: 'Sub-8:00 min/mile' },
  { wave: 'Wave 2', time: '8:05 AM', pace: '8:00–10:00 min/mile' },
  { wave: 'Wave 3', time: '8:10 AM', pace: '10:00+ min/mile / run-walkers' },
];

const aidStations = [
  { mile: 'Mile 2',    supplies: 'Water + sports drink' },
  { mile: 'Mile 4',    supplies: 'Water + sports drink' },
  { mile: 'Finish',    supplies: 'Full recovery station — water and sports drink' },
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
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-20 space-y-20">

        {/* Logistics summary */}
        <section>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-card border border-line p-6">
              <div className="mb-2 flex items-center gap-2">
                <Clock size={16} className="text-pink shrink-0" aria-hidden="true" />
                <dt className="section-label">Start Times</dt>
              </div>
              <dd className="font-body text-sm text-ink leading-relaxed">
                10K: {TEN_K_START_TIME}<br />
                Fun Run: {FUN_RUN_START_TIME}
              </dd>
            </div>

            <div className="rounded-card border border-line p-6">
              <div className="mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-pink shrink-0" aria-hidden="true" />
                <dt className="section-label">10K Start</dt>
              </div>
              <dd className="font-body text-sm text-ink leading-relaxed">
                {EVENT_LOCATION_NAME}<br />
                <span className="text-ash text-xs">{EVENT_LOCATION_ADDRESS}</span>
              </dd>
            </div>

            <div className="rounded-card border border-line p-6">
              <div className="mb-2 flex items-center gap-2">
                <Flag size={16} className="text-pink shrink-0" aria-hidden="true" />
                <dt className="section-label">Finish Line</dt>
              </div>
              <dd className="font-body text-sm text-ink leading-relaxed">
                {FINISH_LOCATION_NAME}<br />
                <span className="text-ash text-xs">{FINISH_LOCATION_ADDRESS}</span>
              </dd>
            </div>

            <div className="rounded-card border border-line p-6">
              <div className="mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-pink shrink-0" aria-hidden="true" />
                <dt className="section-label">Fun Run Start</dt>
              </div>
              <dd className="font-body text-sm text-ink leading-relaxed">
                {FUN_RUN_LOCATION_NAME}<br />
                <span className="text-ash text-xs">{FUN_RUN_LOCATION_ADDRESS}</span>
              </dd>
            </div>

            <div className="rounded-card border border-line p-6">
              <div className="mb-2 flex items-center gap-2">
                <Heart size={16} className="text-pink shrink-0" aria-hidden="true" />
                <dt className="section-label">Entry Donation</dt>
              </div>
              <dd className="font-body text-sm text-ink leading-relaxed">
                10K: ${RECOMMENDED_DONATION_AMOUNT} recommended<br />
                Fun Run: ${RECOMMENDED_DONATION_FUN_RUN} recommended<br />
                <span className="text-ash text-xs">Give more if you&rsquo;re able</span>
              </dd>
            </div>

            <div className="rounded-card border border-line p-6">
              <div className="mb-2 flex items-center gap-2">
                <Package size={16} className="text-pink shrink-0" aria-hidden="true" />
                <dt className="section-label">Check-In</dt>
              </div>
              <dd className="font-body text-sm text-ink leading-relaxed whitespace-pre-line">
                <span className="font-semibold">10K:</span> {CHECK_IN_DATE}{CHECK_IN_TIME ? `\n${CHECK_IN_TIME}` : ''}{CHECK_IN_LOCATION ? `\n${CHECK_IN_LOCATION}` : ''}
                {'\n\n'}<span className="font-semibold">Fun Run:</span> {CHECK_IN_DATE}{'\n'}7:00 AM · LaVell Edwards Stadium
                {'\n\n'}Includes: race bib + bandana
              </dd>
            </div>
          </dl>
        </section>

        {/* 10K Route */}
        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">The 10K Course</h2>
          <div className="space-y-4 font-body text-base leading-relaxed text-ash">
            <p>
              The 10K is a point-to-point, predominantly downhill course that drops more than
              284 feet over 6.2 miles through Provo, Utah. With only one turn on the entire
              course, it is one of the cleanest and most runnable 10K routes in the state.
            </p>
            <p>
              Runners start on North Canyon Road in front of Canyon Crest Elementary School, at an
              elevation of approximately 4,850 feet, and head north toward the mouth of Provo
              Canyon with the canyon walls rising ahead. At the canyon mouth the course makes
              its single left turn onto University Avenue (US-189) and follows it straight
              south through Provo. The consistent, gentle downhill grade makes this course
              fast for all paces.
            </p>
            <p>
              The finish line sits at the intersection of University Avenue and Center Street in
              downtown Provo, in front of the Utah County Courthouse, at an elevation of
              roughly 4,567 feet. The final stretch is lined with spectators as runners pour
              into the heart of downtown.
            </p>
            <div className="rounded-card border border-petal bg-blush p-5 mt-4">
              <p className="font-body text-sm font-bold uppercase tracking-widest text-pink mb-2">Getting to the start</p>
              <p className="font-body text-sm text-ash">
                Because the 10K is point-to-point, runners are responsible for their own
                transportation to the start line. Check-in is in the Canyon Crest Elementary
                School parking lot — plan to arrive by 7:00 AM. Race starts promptly at 8:00 AM.
              </p>
            </div>
          </div>
        </section>

        {/* Fun Run Route */}
        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">The Fun Run Course</h2>
          <div className="space-y-4 font-body text-base leading-relaxed text-ash">
            <p>
              The Fun Run is a ~2-mile point-to-point course starting at LaVell Edwards Stadium
              on the BYU campus. Participants follow University Avenue south through Provo,
              sharing the final stretch with the 10K and crossing the same finish line at
              University Avenue and Center Street in downtown Provo.
            </p>
            <p>
              The course is predominantly downhill along a straight, wide road — accessible for
              all paces and fitness levels. It&rsquo;s the option most families pick: short enough
              for kids to finish, easy to walk the whole way, and strollers are welcome. Whether
              you&rsquo;re a casual walker or a first-time runner, this is your chance to cross a
              finish line for a great cause. The recommended donation is ${RECOMMENDED_DONATION_FUN_RUN},
              compared with ${RECOMMENDED_DONATION_AMOUNT} for the 10K.
            </p>
            <div className="rounded-card border border-petal bg-blush p-5 mt-4">
              <p className="font-body text-sm font-bold uppercase tracking-widest text-pink mb-2">Getting to the start</p>
              <p className="font-body text-sm text-ash">
                Check-in for the Fun Run is at LaVell Edwards Stadium — plan to arrive by 7:00 AM.
                The race starts promptly at 8:00 AM. Participants are responsible for their own
                transportation to the stadium.
              </p>
            </div>
          </div>
        </section>

        {/* Elevation profile */}
        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">10K Elevation Profile</h2>
          <ElevationChartSection />
        </section>

        {/* Map */}
        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">10K Course Map</h2>
          <CourseMapSection />
          <div className="mt-4 flex flex-wrap gap-3">
            {COURSE_GPX_URL ? (
              <a
                href={COURSE_GPX_URL}
                download
                className="btn-ghost inline-flex items-center gap-2 text-xs"
              >
                <Download size={14} /> Download Course GPX
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-pill border border-line px-5 py-3 font-body text-xs font-bold uppercase tracking-widest text-ash opacity-50 cursor-not-allowed">
                <Download size={14} /> GPX Coming Soon
              </span>
            )}
            <a
              href="https://maps.google.com/?q=4664+N+Canyon+Rd,+Provo,+UT+84604"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 text-xs"
            >
              <MapPin size={14} /> Directions to 10K Start
            </a>
            <a
              href="https://maps.google.com/?q=LaVell+Edwards+Stadium,+Provo,+UT+84602"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 text-xs"
            >
              <MapPin size={14} /> Directions to Fun Run Start
            </a>
          </div>
        </section>

        {/* Wave starts */}
        <section>
          <div className="mb-2 flex items-center gap-3">
            <Clock size={22} className="shrink-0 text-pink" />
            <h2 className="font-display text-3xl uppercase text-ink">Wave Starts</h2>
          </div>
          <p className="mb-6 font-body text-sm text-ash">10K — {EVENT_DATE_DISPLAY}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse font-body text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-3 pr-6 text-left text-xs font-bold uppercase tracking-widest text-ash">Wave</th>
                  <th className="py-3 pr-6 text-left text-xs font-bold uppercase tracking-widest text-ash">Time</th>
                  <th className="py-3 text-left text-xs font-bold uppercase tracking-widest text-ash">Pace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {waves.map((w) => (
                  <tr key={w.wave}>
                    <td className="py-4 pr-6 font-display text-lg uppercase text-ink">{w.wave}</td>
                    <td className="py-4 pr-6 font-body text-base text-ink">{w.time}</td>
                    <td className="py-4 font-body text-base text-ash">{w.pace}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Aid stations */}
        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">Aid Stations</h2>
          <p className="mb-4 font-body text-xs font-bold uppercase tracking-widest text-ash">
            10K — locations subject to confirmation
          </p>
          <div className="space-y-0">
            {aidStations.map((a, i) => (
              <div key={a.mile} className="flex items-start gap-4 py-4 border-b border-line last:border-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink font-display text-xs text-white">
                  {i + 1}
                </div>
                <div>
                  <p className="font-display text-base uppercase text-ink">{a.mile}</p>
                  <p className="font-body text-sm text-ash">{a.supplies}</p>
                </div>
              </div>
            ))}
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
