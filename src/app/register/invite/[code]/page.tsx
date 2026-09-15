import type { Metadata } from 'next';
import Link from 'next/link';
import { CHARITY_NAME, CONTACT_EMAIL, EVENT_DATE_DISPLAY } from '@/config/site';
import { getStripe } from '@/lib/stripeRegistration';
import { checkCompCode } from '@/lib/compRegistration';
import { RegisterFlow } from '../../RegisterFlow';

// A private link. Keep it out of search results and previews.
export const metadata: Metadata = {
  title: 'Complete Your Registration',
  robots: { index: false, follow: false, nocache: true },
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // A hand-edited or mangled link can carry a stray % that decodeURIComponent
  // throws on. That should show the same friendly page as a wrong code, not a
  // 500, so fall back to the raw segment and let checkCompCode reject it.
  let supplied: string;
  try {
    supplied = decodeURIComponent(code);
  } catch {
    supplied = code;
  }

  const stripe = getStripe();
  if (!stripe) {
    // The one refusal checkCompCode never sees, so it logs its own reason.
    console.warn(
      '[comp-registration] link refused: stripe-not-configured — STRIPE_SECRET_KEY is unset. Set it and redeploy.',
    );
  }
  const comp = stripe ? await checkCompCode(stripe, supplied) : null;

  if (!comp) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-4xl uppercase text-ink md:text-5xl">
            This link isn&rsquo;t valid
          </h1>
          <p className="mt-4 font-body text-base text-ash">
            It may have expired, or every entry it covers may already have been claimed. Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-pink underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>{' '}
            and we&rsquo;ll sort it out.
          </p>
          <Link href="/" className="btn-primary mt-8 inline-flex">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen">
      <section className="border-b border-line bg-mist py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-4">{EVENT_DATE_DISPLAY}</p>
          <h1 className="font-display text-5xl uppercase text-ink md:text-7xl">
            You&rsquo;re Invited
          </h1>
          <p className="mt-4 font-body text-base text-ash">
            Your entry to Race Against Cancers 2026 has already been covered by a sponsor — there
            is nothing to pay. Fill in your details below and you&rsquo;re in.
          </p>
          <p className="mt-3 font-body text-sm text-ash/80">
            Benefiting {CHARITY_NAME}
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <RegisterFlow comp={{ code: comp.code }} />
      </div>
    </div>
  );
}
