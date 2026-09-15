import type { Metadata } from 'next';
import Link from 'next/link';
import { WaiverText } from '@/components/legal/WaiverText';
import {
  WAIVER_ACCEPTANCE_ADULT,
  WAIVER_ACCEPTANCE_GUARDIAN,
  WAIVER_EFFECTIVE_DATE,
  WAIVER_EVENT_LOCATION,
  WAIVER_SHORT_TITLE,
  WAIVER_SUBTITLE,
  WAIVER_VERSION,
} from '@/data/waiver';
import { EVENT_DATE_DISPLAY, EVENT_NAME, REGISTRATION_OPEN } from '@/config/site';

export const metadata: Metadata = {
  title: WAIVER_SHORT_TITLE,
  description: `The participant agreement, assumption of risk, release of liability, and indemnification every athlete accepts when registering for ${EVENT_NAME}.`,
};

export default function WaiverPage() {
  return (
    <div className="bg-paper">
      <section className="bg-mist py-20 border-b border-line">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-4">Legal</p>
          <h1 className="font-display text-5xl uppercase text-ink md:text-7xl">
            {WAIVER_SHORT_TITLE}
          </h1>
          <p className="mt-4 font-body text-sm text-ash">{WAIVER_SUBTITLE}</p>
          <p className="mt-2 font-body text-sm text-ash">
            Version {WAIVER_VERSION} · Effective {WAIVER_EFFECTIVE_DATE}
          </p>
          <p className="mt-1 font-body text-sm text-ash">
            Event {EVENT_DATE_DISPLAY} · {WAIVER_EVENT_LOCATION}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-20">
        <WaiverText variant="page" />

        <section className="mt-12 rounded-card border border-line p-6">
          <h2 className="mb-3 font-display text-xl uppercase text-ink">How you accept</h2>
          <p className="font-body text-sm leading-relaxed text-ash">
            There is no paper form. You accept this agreement by checking the box that applies to
            you at registration:
          </p>
          <ul className="mt-4 space-y-3 font-body text-sm text-ash">
            {[WAIVER_ACCEPTANCE_ADULT, WAIVER_ACCEPTANCE_GUARDIAN].map((option) => (
              <li key={option} className="flex items-start gap-4">
                <span className="mt-2 h-px w-6 shrink-0 bg-pink" aria-hidden="true" />
                {option}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-body text-sm leading-relaxed text-ash">
            Your name, date of birth, and — for an athlete under 18 — your parent or legal
            guardian&rsquo;s name are collected on the registration form, and we record the date and
            time you accepted along with the version above. That record is your signature under
            Section 11.8.
          </p>
          {REGISTRATION_OPEN && (
            <Link href="/register" className="btn-primary mt-6">
              Register
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
