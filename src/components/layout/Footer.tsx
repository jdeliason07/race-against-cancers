import { CHARITY_NAME, EVENT_YEAR, ORG_NAME, ORG_EIN } from '@/config/site';
import { FooterLinks } from './FooterLinks';

export function Footer() {
  return (
    <footer className="border-t border-petal bg-blush text-ink">
      <div className="mx-auto max-w-7xl px-6 pb-28 pt-16 md:pb-16">
        <div className="mb-12 text-center">
          <p className="font-display text-[clamp(28px,9vw,72px)] uppercase leading-none">
            RACE<span className="text-pink">AGAINST</span>CANCERS
          </p>
          <p className="mt-4 font-body text-sm text-ash tracking-widest uppercase">
            10K, 5K &amp; 1-Mile Walk · November 7, 2026 · Creekside Park, Alpine
          </p>
        </div>

        {/* Hidden on /register — see FooterLinks. */}
        <FooterLinks>Benefiting {CHARITY_NAME}</FooterLinks>

        <p className="mt-8 text-center font-body text-xs text-ash">
          {ORG_NAME} is a registered 501(c)(3) nonprofit organization. EIN {ORG_EIN}.
        </p>
        <p className="mt-2 text-center font-body text-xs text-ash/70">
          © {EVENT_YEAR} {ORG_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
