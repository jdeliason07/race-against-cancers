import Link from 'next/link';
import {
  SOCIAL_INSTAGRAM, SOCIAL_FACEBOOK,
  SOCIAL_TWITTER, SOCIAL_YOUTUBE, CHARITY_NAME, EVENT_YEAR, CONTACT_PHONE, ORG_NAME, ORG_NAME_SHORT,
  ORG_EIN, REGISTRATION_OPEN,
} from '@/config/site';
import { Phone } from 'lucide-react';

function IconInstagram({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconFacebook({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconTwitterX({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconYoutube({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="font-display text-[clamp(28px,9vw,72px)] uppercase leading-none">
            RACE<span className="text-pink">AGAINST</span>CANCERS
          </p>
          <p className="mt-4 font-body text-sm text-white/55 tracking-widest uppercase">
            10K & Fun Run · November 7, 2026
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 border-t border-white/10 pt-10 md:flex-row md:justify-between">
          <p className="font-body text-xs text-white/40 tracking-widest uppercase">
            Benefiting {CHARITY_NAME}
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-5" aria-label="Footer navigation">
            <Link href="/register" className="font-body text-xs text-white/55 hover:text-pink transition-colors uppercase tracking-widest">{REGISTRATION_OPEN ? 'Register' : 'Join the Waitlist'}</Link>
            <Link href="/race-details" className="font-body text-xs text-white/55 hover:text-pink transition-colors uppercase tracking-widest">Race Details</Link>
<Link href="/volunteer" className="font-body text-xs text-white/55 hover:text-pink transition-colors uppercase tracking-widest">Volunteer</Link>
            <Link href="/sponsor" className="font-body text-xs text-white/55 hover:text-pink transition-colors uppercase tracking-widest">Sponsor</Link>
            <Link href="/faq" className="font-body text-xs text-white/55 hover:text-pink transition-colors uppercase tracking-widest">FAQ</Link>
            <Link href="/about" className="font-body text-xs text-white/55 hover:text-pink transition-colors uppercase tracking-widest">About</Link>
            <Link href="/privacy" className="font-body text-xs text-white/55 hover:text-pink transition-colors uppercase tracking-widest">Privacy</Link>
            <Link href="/waiver" className="font-body text-xs text-white/55 hover:text-pink transition-colors uppercase tracking-widest">Waiver</Link>
            <a href={`tel:${CONTACT_PHONE.replace(/-/g, '')}`} className="font-body text-xs text-white/55 hover:text-pink transition-colors uppercase tracking-widest flex items-center gap-1">
              <Phone size={13} /> {CONTACT_PHONE}
            </a>
          </nav>
          <div className="flex items-center gap-4">
            {SOCIAL_INSTAGRAM && !SOCIAL_INSTAGRAM.includes('[[') && (
              <a href={SOCIAL_INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/40 hover:text-pink transition-colors">
                <IconInstagram size={18} />
              </a>
            )}
            {SOCIAL_FACEBOOK && !SOCIAL_FACEBOOK.includes('[[') && (
              <a href={SOCIAL_FACEBOOK} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/40 hover:text-pink transition-colors">
                <IconFacebook size={18} />
              </a>
            )}
            {SOCIAL_TWITTER && !SOCIAL_TWITTER.includes('[[') && (
              <a href={SOCIAL_TWITTER} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="text-white/40 hover:text-pink transition-colors">
                <IconTwitterX size={18} />
              </a>
            )}
            {SOCIAL_YOUTUBE && !SOCIAL_YOUTUBE.includes('[[') && (
              <a href={SOCIAL_YOUTUBE} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white/40 hover:text-pink transition-colors">
                <IconYoutube size={18} />
              </a>
            )}
          </div>
        </div>

        <p className="mt-8 text-center font-body text-xs text-white/40">
          {ORG_NAME_SHORT} is a registered 501(c)(3) nonprofit organization. EIN {ORG_EIN}.
        </p>
        <p className="mt-2 text-center font-body text-xs text-white/25">
          © {EVENT_YEAR} {ORG_NAME} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
