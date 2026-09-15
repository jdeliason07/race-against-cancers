import type { Metadata } from 'next';
import { CONTACT_PHONE, CONTACT_EMAIL, EVENT_YEAR, CHARITY_NAME, ORG_NAME } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Race Against Cancers 2026. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-paper">
      <section className="bg-mist py-20 border-b border-line">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label mb-4">Legal</p>
          <h1 className="font-display text-5xl uppercase text-ink md:text-7xl">Privacy Policy</h1>
          <p className="mt-4 font-body text-sm text-ash">Last updated: June 2026</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-20 space-y-12">

        <section>
          <h2 className="mb-4 font-display text-2xl uppercase text-ink">Overview</h2>
          <p className="font-body text-base leading-relaxed text-ash">
            {ORG_NAME} (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;) respects your privacy. This policy
            explains what information we collect when you use this website, how we use it, and
            your rights. All donations collected through this event benefit {CHARITY_NAME}.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl uppercase text-ink">Information We Collect</h2>
          <div className="space-y-4 font-body text-base leading-relaxed text-ash">
            <p><strong className="text-ink">Waitlist information:</strong> When you join the waitlist before registration opens, we collect your name, email address, and phone number so we can notify you by email or text message when registration goes live. You can ask us to remove you from the waitlist at any time.</p>
            <p><strong className="text-ink">Registration information:</strong> When you register for the race, we collect your name, email address, phone number, date of birth, and emergency contact details. If the athlete is under 18 on race day, we also collect the name of the parent or legal guardian who accepts the waiver on their behalf. This information is necessary to process your registration.</p>
            <p><strong className="text-ink">Payment information:</strong> Payment is processed by Stripe, a third-party payment processor. We do not store your credit card number or financial details. Stripe&rsquo;s privacy policy governs how your payment data is handled: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-pink hover:text-raspberry underline underline-offset-2">stripe.com/privacy</a>.</p>
            <p><strong className="text-ink">Usage data:</strong> We may collect basic analytics about how you use the site (pages visited, time on site). This data is aggregated and not tied to individuals.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl uppercase text-ink">How We Use Your Information</h2>
          <ul className="space-y-3 font-body text-base text-ash">
            {[
              'To process your race registration and donation.',
              'To notify you by email or text message when registration opens, if you joined the waitlist.',
              'To send you race-day logistics, check-in reminders, and important updates about the event.',
              'To contact you if there is an emergency or issue with your registration.',
              'To communicate with your emergency contact if necessary on race day.',
              'To comply with legal obligations.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-2 h-px w-6 shrink-0 bg-pink" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl uppercase text-ink">Information Sharing</h2>
          <p className="font-body text-base leading-relaxed text-ash">
            We do not sell, rent, or share your personal information with third parties for
            marketing purposes. We share your information only with:
          </p>
          <ul className="mt-4 space-y-3 font-body text-base text-ash">
            {[
              `${CHARITY_NAME} — as needed to process your donation and issue receipts.`,
              'Stripe — our payment processor, which securely handles payments and stores our waitlist and registration records.',
              'Race logistics providers (timing company, check-in) — limited to name and bib information necessary for event operations.',
              'Law enforcement or legal authorities — only when required by law.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-2 h-px w-6 shrink-0 bg-pink" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl uppercase text-ink">Media &amp; Photography</h2>
          <p className="font-body text-base leading-relaxed text-ash">
            By registering, you agree that {ORG_NAME} may use photographs and
            video taken at the event for promotional purposes, including on this website, social
            media, and other materials. If you have a concern about a specific photograph or
            video, please contact us.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl uppercase text-ink">Data Retention</h2>
          <p className="font-body text-base leading-relaxed text-ash">
            We retain your registration information for up to three years after the event for
            legal and tax purposes. Payment records held by Stripe are subject to Stripe&rsquo;s
            own retention policies.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl uppercase text-ink">Your Rights</h2>
          <p className="font-body text-base leading-relaxed text-ash">
            You may request access to, correction of, or deletion of your personal data by
            contacting us directly. We will respond within 30 days. Note that some data may be
            required to be retained for legal or tax compliance.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl uppercase text-ink">Cookies</h2>
          <p className="font-body text-base leading-relaxed text-ash">
            This site uses only functional cookies necessary for the registration flow (e.g.,
            Stripe session cookies). We do not use advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl uppercase text-ink">Contact</h2>
          <p className="font-body text-base leading-relaxed text-ash mb-4">
            Questions about this privacy policy or your data? Reach us at:
          </p>
          <div className="flex flex-col gap-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-body text-sm font-bold tracking-widest text-pink hover:text-raspberry transition-colors break-all"
            >
              {CONTACT_EMAIL}
            </a>
            <a
              href={`tel:${CONTACT_PHONE.replace(/-/g, '')}`}
              className="font-body text-sm font-bold uppercase tracking-widest text-pink hover:text-raspberry transition-colors"
            >
              {CONTACT_PHONE}
            </a>
          </div>
        </section>

        <p className="font-body text-xs text-ash border-t border-line pt-8">
          © {EVENT_YEAR} {ORG_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
