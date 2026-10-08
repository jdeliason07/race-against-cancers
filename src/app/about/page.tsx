import Link from 'next/link';
import Image from 'next/image';
import { CHARITY_NAME, CHARITY_URL, REGISTRATION_OPEN, RUNNER_MILESTONES, ORG_NAME, ORG_EIN, TEAM } from '@/config/site';
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
          <h1 className="font-display text-5xl uppercase text-ink md:text-7xl">About Us</h1>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-16 px-6 py-20">
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
              100% funds cancer treatment
            </p>
            <p className="font-body text-sm leading-relaxed text-ash">
              Every dollar donated goes to paying for treatment for cancer patients at{' '}
              {CHARITY_NAME} — this year, three local families. None of it goes to race expenses.
            </p>
            <p className="mt-4 font-body text-xs text-ash">
              {ORG_NAME} is a 501(c)(3) nonprofit (EIN {ORG_EIN}). Donations are tax-deductible to
              the extent allowed by law.
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
              That&apos;s our first target on the start line for Intermountain Cancer Center Utah Valley.
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
