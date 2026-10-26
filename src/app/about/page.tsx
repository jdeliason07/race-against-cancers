import Link from 'next/link';
import Image from 'next/image';
import { BENEFICIARY_NAME, BENEFICIARY_FIRST_NAME, REGISTRATION_OPEN, RUNNER_MILESTONES, ORG_NAME, ORG_EIN, TEAM, IMPACT_SPONSOR_LINE } from '@/config/site';
import { RegistrationTeaser } from '@/components/ui/RegistrationTeaser';
import { PhotoCarousel } from '@/components/ui/PhotoCarousel';
import { BROOKS_BADGE, BROOKS_PHOTOS, BROOKS_STORY, BROOKS_TAGLINE } from '@/data/brooks';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: `Why Race Against Cancers exists, how it works, and where the money goes.`,
};

export default function AboutPage() {
  return (
    <div className="bg-paper">
      <section className="border-b border-line bg-mist py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-4">Our mission</p>
          <h1 className="font-display text-5xl uppercase text-ink md:text-7xl">About Us</h1>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-20">
        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">Who we are</h2>
          <div className="space-y-4 font-body text-base leading-relaxed text-ash">
            <p>
              One late night, a group of friends realized how grateful we were for our blessings.
              Inspired to give back, we created this race to help others — motivated by the
              kindness shown to us. Our excitement grew as we shared the idea, leading us to
              commit fully.
            </p>
            <p>
              We wanted to do more than wear a ribbon. So we built a race: one morning where a
              whole community shows up, runs for someone they love, and puts every dollar toward
              real treatment for real people. Thank you for joining us.
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {TEAM.map((person) => {
              const initials = person.name.split(' ').map((n) => n[0]).join('');
              return (
                <li key={person.name} className="text-center">
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={person.name}
                      width={160}
                      height={160}
                      className="mx-auto aspect-square h-32 w-32 rounded-full border-4 border-blush object-cover"
                    />
                  ) : (
                    <div
                      className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-petal bg-blush font-display text-4xl text-pink"
                      aria-hidden="true"
                    >
                      {initials}
                    </div>
                  )}
                  <p className="mt-4 font-display text-xl uppercase text-ink">{person.name}</p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Full width so the photos can run edge to edge. Photos and words live
          in src/data/brooks.ts. */}
      <section id="brooks" aria-labelledby="brooks-heading" className="overflow-hidden border-y border-line bg-mist py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 id="brooks-heading" className="mb-8 font-display text-3xl uppercase text-ink">
            Who we race in honor of: {BENEFICIARY_NAME}
          </h2>
          <div className="flex flex-col items-start gap-8 sm:flex-row">
            <Image
              src={BROOKS_BADGE}
              alt={`Brave Buddy: ${BROOKS_TAGLINE.toLowerCase()}`}
              width={128}
              height={128}
              className="h-28 w-28 shrink-0 -rotate-6 rounded-[16px] border-4 border-white shadow-[0_14px_34px_-14px_rgba(28,23,25,0.45)] sm:h-32 sm:w-32"
            />
            <div className="space-y-4 font-body text-base leading-relaxed text-ash">
              <p className="font-display text-2xl uppercase tracking-wide text-pink">{BROOKS_TAGLINE}</p>
              {BROOKS_STORY.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
        <PhotoCarousel photos={BROOKS_PHOTOS} label={`Photos of ${BENEFICIARY_FIRST_NAME}`} className="mt-6" />
      </section>

      <div className="mx-auto max-w-3xl space-y-16 px-6 py-20">
        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">Where the money goes</h2>
          <div className="rounded-card border-2 border-pink bg-blush p-8">
            <p className="mb-4 font-display text-2xl uppercase text-ink">
              100% goes to families fighting cancer
            </p>
            <p className="font-body text-sm leading-relaxed text-ash">
              {IMPACT_SPONSOR_LINE} None of it goes to race expenses.
            </p>
            <p className="mt-4 font-body text-xs text-ash">
              {ORG_NAME} is a 501(c)(3) nonprofit (EIN {ORG_EIN}). Donations are tax-deductible to
              the extent allowed by law. Donations are pooled and used at the board&rsquo;s discretion
              for our charitable purpose, so gifts can&rsquo;t be designated for a specific individual
              or family.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">Our first milestone</h2>
          <div className="rounded-card border-2 border-pink bg-blush p-8 text-center">
            <p className="font-display text-[clamp(56px,10vw,96px)] uppercase leading-none text-ink">
              {RUNNER_MILESTONES[0].toLocaleString()} Runners
            </p>
            <p className="mt-4 font-body text-base text-ash">
              That&apos;s our first target on the start line for {BENEFICIARY_FIRST_NAME}.
              Every registration is a donation too, and every one of them gets us closer.
            </p>
          </div>
        </section>

        <div className="pt-4">
          <Link href="/register" className="btn-primary">
            {REGISTRATION_OPEN ? 'Register' : 'Join the Waitlist'}
          </Link>
          <RegistrationTeaser className="mt-4" />
        </div>
      </div>
    </div>
  );
}
