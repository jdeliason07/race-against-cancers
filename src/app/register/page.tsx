import type { Metadata } from 'next';
import {
  CHARITY_NAME, FUNDRAISING_GOAL, MOMENTUM_MIN_RAISED,
  RECOMMENDED_DONATION_AMOUNT, RECOMMENDED_DONATION_FUN_RUN,
  REGISTRATION_OPEN, REGISTRATION_OPENS_LABEL,
} from '@/config/site';
import { getDonationTotal } from '@/lib/getDonationTotal';
import { RegistrationLanding } from './RegistrationLanding';
import { PreSignupForm } from './PreSignupForm';

const opensCopy = `Registration opens ${REGISTRATION_OPENS_LABEL}`;

// This is the QR landing page, so it has to be quick. Statically rendered and
// refreshed every 5 minutes: the donation total behind it is a paginated Stripe
// search, and putting that in the request path would make every scanner wait on
// it. That is also why the campaign `?s=` code is read in the browser rather
// than from searchParams — reading searchParams here would force the page
// dynamic and undo this.
export const revalidate = 300;

export const metadata: Metadata = REGISTRATION_OPEN
  ? {
      title: 'Register',
      description: `Register for Race Against Cancers 2026 — 10K & Fun Run on November 7, 2026. Your registration is a direct donation to ${CHARITY_NAME}.`,
    }
  : {
      title: 'Join the Waitlist',
      description: `${opensCopy}. Join the waitlist to be notified the moment registration goes live for Race Against Cancers 2026.`,
    };

export default async function RegisterPage() {
  if (!REGISTRATION_OPEN) {
    return (
      <div className="bg-paper min-h-screen">
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

  const raised = await getDonationTotal();

  return (
    <RegistrationLanding
      raised={raised}
      goal={FUNDRAISING_GOAL}
      showMomentum={raised >= MOMENTUM_MIN_RAISED}
    />
  );
}
