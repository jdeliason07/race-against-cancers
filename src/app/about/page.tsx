import Link from 'next/link';
import Image from 'next/image';
import { CHARITY_NAME, CHARITY_URL, REGISTRATION_OPEN, RUNNER_GOAL } from '@/config/site';
import { RegistrationTeaser } from '@/components/ui/RegistrationTeaser';
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
          <h1 className="font-display text-5xl uppercase text-ink md:text-7xl">About</h1>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-16 px-6 py-20">
        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">Why this exists</h2>
          <p className="font-body text-base leading-relaxed text-ash">
            One late night, a group of friends realized how grateful we were for our blessings.
            Inspired to give back, we created this race to help others—motivated by the kindness
            shown to us. Our excitement grew as we shared the idea, leading us to commit fully.
            Thank you for joining us in our mission to give back.
          </p>
        </section>

        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">
            The charity: {CHARITY_NAME}
          </h2>

          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/intermountain-health-logo.svg"
              alt="Intermountain Health"
              width={320}
              height={98}
              className="object-contain"
              unoptimized
            />
          </div>

          <p className="mb-4 font-body text-base leading-relaxed text-ash">
            Intermountain Cancer Center Utah Valley, in Provo, brings comprehensive cancer care
            close to home for Utah County. Part of Intermountain Health, the center treats more
            than 20 forms of cancer with a team of multidisciplinary experts, advanced technology,
            and seamless coordination across every step of a patient&apos;s journey.
          </p>
          <p className="mb-6 font-body text-base leading-relaxed text-ash">
            The center offers medical, radiation, and surgical oncology alongside supportive
            services like patient navigation, nutrition, palliative care, survivorship programs,
            and access to clinical trials. Free support groups and wellness classes help patients
            and families find strength in community throughout treatment and beyond.
          </p>

          <a
            href={CHARITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm font-bold uppercase tracking-widest text-pink transition-colors hover:text-raspberry"
          >
            Visit Intermountain Cancer Center Utah Valley →
          </a>
        </section>

        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">Where the money goes</h2>
          <div className="rounded-card border-2 border-pink bg-blush p-8">
            <p className="mb-4 font-display text-2xl uppercase text-ink">
              Donations benefit {CHARITY_NAME}
            </p>
            <p className="font-body text-sm leading-relaxed text-ash">
              Registration donations support Intermountain Cancer Center Utah Valley. We are
              actively seeking sponsors to cover the cost of putting on the race, so that as much
              of what runners give as possible reaches the cause.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-6 font-display text-3xl uppercase text-ink">Our goal</h2>
          <div className="rounded-card border-2 border-pink bg-blush p-8 text-center">
            <p className="font-display text-[clamp(56px,10vw,96px)] uppercase leading-none text-ink">
              {RUNNER_GOAL.toLocaleString()} Runners
            </p>
            <p className="mt-4 font-body text-base text-ash">
              That&apos;s how many we want running for Intermountain Cancer Center Utah Valley.
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
