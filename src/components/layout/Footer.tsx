import { CHARITY_NAME, EVENT_YEAR, ORG_NAME, ORG_EIN } from '@/config/site';
import { FooterLinks } from './FooterLinks';

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="font-display text-[clamp(28px,9vw,72px)] uppercase leading-none">
            RACE<span className="text-pink">AGAINST</span>CANCERS
          </p>
          <p className="mt-4 font-body text-sm text-white/55 tracking-widest uppercase">
            10K &amp; Fun Run · November 7, 2026
          </p>
        </div>

        {/* Hidden on /register — see FooterLinks. */}
        <FooterLinks>Benefiting {CHARITY_NAME}</FooterLinks>

        <p className="mt-8 text-center font-body text-xs text-white/40">
          {ORG_NAME} is a registered 501(c)(3) nonprofit organization. EIN {ORG_EIN}.
        </p>
        <p className="mt-2 text-center font-body text-xs text-white/25">
          © {EVENT_YEAR} {ORG_NAME} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
