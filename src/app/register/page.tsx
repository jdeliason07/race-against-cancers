import type { Metadata } from 'next';
import {
  IMPACT_HEADLINE, PROCEEDS_TO, RECOMMENDED_DONATION_AMOUNT, RECOMMENDED_DONATION_5K, RECOMMENDED_DONATION_FUN_RUN,
  REGISTRATION_OPEN, REGISTRATION_OPENS_LABEL, GIVE_WHAT_YOU_CAN,
  BENEFICIARY_FIRST_NAME, NONPROFIT_PARTNERS, PARTNER_SHARE_PERCENT, PARTNERS_ENABLED,
} from '@/config/site';
import { RegisterFlow } from './RegisterFlow';
import { PreSignupForm } from './PreSignupForm';

const opensCopy = `Registration opens ${REGISTRATION_OPENS_LABEL}`;

export const metadata: Metadata = REGISTRATION_OPEN
  ? {
      title: 'Register',
      description: `Register for Race Against Cancers 2026 — 10K, 5K & 1-Mile Walk on November 7, 2026 at Riverview Park, Provo. Your registration is a tax-deductible donation, and 100% of it goes to ${PROCEEDS_TO}.`,
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
              {`Suggested donations: 10K $${RECOMMENDED_DONATION_AMOUNT} · 5K $${RECOMMENDED_DONATION_5K} · 1-Mile Walk $${RECOMMENDED_DONATION_FUN_RUN}`}
            </p>
            <p className="mt-1 font-body text-sm text-ash">{GIVE_WHAT_YOU_CAN}</p>
            <p className="mt-1 font-body text-sm text-ash">
              The 1-Mile Walk is short enough for kids to finish and easy to walk the whole way.
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
            10K, 5K &amp; 1-Mile Walk at Riverview Park, Provo. {IMPACT_HEADLINE}.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <RegisterFlow />
      </div>
      {PARTNERS_ENABLED && <PartnerBlurbs />}
    </div>
  );
}

/**
 * Who the nonprofit partners are, under the form — on every step, so a runner
 * who followed a partner's link sees why that partner's name is in the box.
 * The split is spelled out because the header above says 100% goes to the
 * beneficiary, and for these registrations it doesn't.
 */
function PartnerBlurbs() {
  return (
    <section aria-label="Nonprofit partners" className="mx-auto max-w-2xl px-6 pb-16">
      <div className="space-y-6 rounded-card border border-petal bg-mist p-6">
        {NONPROFIT_PARTNERS.map((partner) => (
          <div key={partner.name}>
            <p className="section-label mb-2">In partnership with</p>
            <h2 className="font-display text-3xl uppercase leading-tight text-ink">
              {partner.url ? (
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-petal underline-offset-4 hover:text-pink"
                >
                  {partner.name}
                </a>
              ) : (
                partner.name
              )}
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-ash">{partner.blurb}</p>
            <p className="mt-2 font-body text-sm leading-relaxed text-ash">
              Here with {partner.name}? Name them in the &ldquo;Nonprofit partner&rdquo; box when
              you register, and your donation is split {100 - PARTNER_SHARE_PERCENT}/
              {PARTNER_SHARE_PERCENT} between {BENEFICIARY_FIRST_NAME} and {partner.name}.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
