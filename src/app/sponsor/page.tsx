import { SponsorForm } from './SponsorForm';
import { CHARITY_NAME, DONATION_PROMISE } from '@/config/site';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Sponsor',
  description: `Sponsor Race Against Cancers and cover the cost of the race, so that every runner's donation reaches ${CHARITY_NAME} in full.`,
};

export default function SponsorPage() {
  return (
    <div className="bg-paper">
      <section className="border-b border-line bg-mist py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-4">Partner with us</p>
          <h1 className="font-display text-5xl uppercase text-ink md:text-7xl">
            Become a Sponsor
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="font-body text-lg leading-relaxed text-ash">
          We make every runner a promise: {DONATION_PROMISE}{' '}
          Sponsors are how we keep it &mdash; your support pays for the permits, the course, the
          bibs, the aid stations and the card processing, so not one dollar of a runner&apos;s
          donation has to.
        </p>

        <div className="mt-12 rounded-card border border-line bg-mist p-8 text-left">
          <p className="mb-5 text-center font-body text-base text-ink">
            Interested? Reach out and we&apos;ll get in touch.
          </p>
          <SponsorForm />
        </div>
      </div>
    </div>
  );
}
