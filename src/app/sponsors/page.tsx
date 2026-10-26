import Image from 'next/image';
import { ArrowUpRight, Check, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import { CONTACT_EMAIL, PROCEEDS_TO } from '@/config/site';
import { SponsorLogo } from '@/components/ui/SponsorLogo';
import {
  PRESENTING_SPONSORS, SUPPORTING_SPONSORS, sponsorDomain,
  type Sponsor,
} from '@/data/sponsors';

const INTRO = `Our sponsors cover the cost of putting on this race, so 100% of every donation goes to ${PROCEEDS_TO}. Thank you.`;

export const metadata: Metadata = {
  title: 'Our Sponsors',
  description: INTRO,
};

// What a sponsor receives, for the "Become a sponsor" section. Acknowledgments
// only — see the note at the top of src/data/sponsors.ts.
const SPONSOR_BENEFITS = [
  'A booth at the finish-line festival',
  'Logo placement across the race and on water stations',
  'An offer in finisher packets',
  'Race-day announcements',
  'An Instagram collab',
  'Features on our email list, website, and social',
];

const SPONSOR_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Sponsoring Race Against Cancers')}`;

export default function SponsorsPage() {
  return (
    <div className="bg-paper">
      <section className="border-b border-line bg-mist py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-4">Thank you</p>
          <h1 className="font-display text-5xl uppercase text-ink md:text-7xl">Our Sponsors</h1>
          <p className="mx-auto mt-6 max-w-2xl font-body text-lg leading-relaxed text-ash">{INTRO}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-20 px-6 py-20">
        {PRESENTING_SPONSORS.length > 0 && (
          <section aria-labelledby="presenting-heading">
            <SectionRule id="presenting-heading">Presenting sponsors</SectionRule>
            <ul className="grid gap-6 md:grid-cols-3">
              {PRESENTING_SPONSORS.map((s) => (
                <li key={s.name} className="flex flex-col rounded-card border-2 border-petal bg-paper p-6">
                  <SponsorLogo sponsor={s} tile className="h-32 w-full p-5" />
                  <h3 className="mt-6 font-display text-3xl uppercase leading-tight text-ink">{s.name}</h3>
                  <SponsorQuote quote={s.quote} />
                  <TeamPhoto sponsor={s} />
                  <SponsorSiteLink url={s.url} className="mt-auto pt-6" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {SUPPORTING_SPONSORS.length > 0 && (
          <section aria-labelledby="supporting-heading">
            <SectionRule id="supporting-heading">Supporting sponsors</SectionRule>
            <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
              {SUPPORTING_SPONSORS.map((s) => (
                <li key={s.name} className="flex flex-col gap-4 rounded-card border border-line bg-paper p-5 sm:flex-row sm:items-start">
                  <SponsorLogo sponsor={s} tile className="h-20 w-full p-3 sm:w-32" />
                  <div className="flex-1">
                    <h3 className="font-display text-2xl uppercase leading-tight text-ink">{s.name}</h3>
                    <SponsorQuote quote={s.quote} small />
                    <TeamPhoto sponsor={s} />
                    <SponsorSiteLink url={s.url} className="mt-4" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <section aria-labelledby="become-heading" className="border-t border-line bg-blush py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-4">Partner with us</p>
          <h2 id="become-heading" className="font-display text-4xl uppercase text-ink md:text-5xl">
            Become a sponsor
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-ash">
            Sponsors cover the cost of the race. Here&rsquo;s how we thank them:
          </p>
          <ul className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            {SPONSOR_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 rounded-card border border-petal bg-paper p-4">
                <Check size={18} className="mt-0.5 shrink-0 text-pink" aria-hidden="true" />
                <span className="font-body text-sm font-semibold leading-snug text-ink">{benefit}</span>
              </li>
            ))}
          </ul>
          <a href={SPONSOR_MAILTO} className="btn-primary mt-10 px-6 text-sm sm:px-10 sm:py-5 sm:text-base">
            <Mail size={18} aria-hidden="true" /> Email us about sponsoring
          </a>
          <p className="mt-4 font-body text-sm text-ash">
            Or write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-ink underline decoration-petal underline-offset-4 hover:text-pink">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

function SectionRule({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="rule-line mb-8">
      <div className="h-px flex-1 bg-petal" aria-hidden="true" />
      <h2 id={id} className="section-label">{children}</h2>
      <div className="h-px flex-1 bg-petal" aria-hidden="true" />
    </div>
  );
}

/** The owner's quote, when one is set in src/data/sponsors.ts. Nothing otherwise. */
function SponsorQuote({ quote, small = false }: { quote: string; small?: boolean }) {
  if (!quote) return null;
  return (
    <blockquote className={`mt-3 font-body italic leading-relaxed text-ash ${small ? 'text-sm' : 'text-base'}`}>
      &ldquo;{quote}&rdquo;
    </blockquote>
  );
}

/** The team photo, when one is set in src/data/sponsors.ts. Nothing otherwise. */
function TeamPhoto({ sponsor }: { sponsor: Sponsor }) {
  if (!sponsor.photo) return null;
  return (
    <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-card">
      <Image
        src={sponsor.photo}
        alt={`The ${sponsor.name} team`}
        fill
        sizes="(min-width: 768px) 320px, 100vw"
        className="object-cover"
      />
    </div>
  );
}

function SponsorSiteLink({ url, className }: { url: string; className?: string }) {
  return (
    <p className={className}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-body text-xs font-bold uppercase tracking-widest text-pink transition-colors hover:text-raspberry"
      >
        {sponsorDomain(url)}
        <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </p>
  );
}
