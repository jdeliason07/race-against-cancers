'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { REGISTRATION_OPEN } from '@/config/site';

/**
 * Phone-only register bar pinned to the bottom of the screen. It slides in
 * once the visitor scrolls past the hero (so it never doubles up with the big
 * Register button) and stays off the register, admin, and waiver pages.
 */
export function StickyRegisterBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hiddenHere =
    pathname.startsWith('/register') || pathname.startsWith('/admin') || pathname === '/waiver';
  if (hiddenHere) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-petal bg-paper/95 px-4 pt-3 backdrop-blur transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="leading-tight">
          <p className="font-display text-base uppercase text-ink">Nov 7 · Creekside Park</p>
          <p className="font-body text-xs text-ash">10K · 5K · 1-Mile Walk</p>
        </div>
        <Link href="/register" className="btn-primary px-6 py-3" tabIndex={visible ? undefined : -1}>
          {REGISTRATION_OPEN ? 'Register' : 'Join the Waitlist'}
        </Link>
      </div>
    </div>
  );
}
