import type { Metadata } from 'next';
import {
  CHARITY_NAME, RECOMMENDED_DONATION_AMOUNT, RECOMMENDED_DONATION_FUN_RUN,
  REGISTRATION_OPEN, REGISTRATION_OPENS_LABEL,
} from '@/config/site';
import { RegisterFlow } from './RegisterFlow';
import { PreSignupForm } from './PreSignupForm';

const opensCopy = `Registration opens ${REGISTRATION_OPENS_LABEL}`;

export const metadata: Metadata = REGISTRATION_OPEN
  ? {
      title: 'Register',
      description: `Register for Race Against Cancers 2026 — 10K & Fun Run on November 7, 2026. Your registration is a direct donation to ${CHARITY_NAME}.`,
    }
  : {
      title: 'Join the Waitlist',
      description: `${opensCopy}. Join the waitlist to be notified the moment registration goes live for Race Against Cancers 2026.`,
    };

export default function RegisterPage() {
  if (!REGISTRATION_OPEN) {
    return (
      <div className="bg-paper">
        <section className="border-b border-line bg-mist py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="section-label mb-4">{opensCopy}</p>
            <h1 className="font-display text-5xl uppercase text-ink md:text-7xl">
              Join the Waitlist
            </h1>
            <p className="mt-4 font-body text-base text-ash">
              Be the first to know the moment registration opens.
            </p>
            <p className="mt-3 font-body text-base text-ink">
              10K ${RECOMMENDED_DONATION_AMOUNT} · Family Fun Run ${RECOMMENDED_DONATION_FUN_RUN}
            </p>
            <p className="mt-1 font-body text-sm text-ash">
              The ~2-mile Fun Run is short enough for kids to finish and easy to walk the whole way.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-2xl px-6 py-16">
          <PreSignupForm />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-line bg-mist py-10">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-3">November 7, 2026</p>
          <h1 className="font-display text-4xl uppercase text-ink md:text-6xl">It&rsquo;s Time</h1>
          <p className="mt-3 font-body text-base text-ash">
            10K &amp; Family Fun Run — benefiting {CHARITY_NAME}
          </p>
          <p className="mt-2 font-body text-sm text-ash">
            Registering a family, team, or company? Enter how many athletes and the recommended amount adjusts.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <RegisterFlow />
      </div>
    </div>
  );
}
