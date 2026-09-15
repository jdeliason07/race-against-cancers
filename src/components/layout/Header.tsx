'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { REGISTRATION_OPEN, REGISTRATION_OPENS_DATE } from '@/config/site';

const navLinks = [
  { href: '/register', label: REGISTRATION_OPEN ? 'Register' : 'Join the Waitlist' },
  { href: '/race-details',  label: 'Race Details' },
  { href: '/volunteer',     label: 'Become a Volunteer' },
  { href: '/sponsor',       label: 'Become a Sponsor' },
  { href: '/faq',           label: 'FAQ' },
  { href: '/about',         label: 'About' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // The organizer pages aren't selling anything, so the public call to action
  // has no place there — and without it the wordmark centres.
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  // /register is the QR landing page and it has exactly one job. Every nav
  // link on it is an exit from the only funnel we have, and the Register
  // button is a button back to the page you are already on. So the header
  // there is the wordmark alone — kept, rather than removed outright, because
  // a page asking for a card number should still let you look at whose page
  // it is.
  const isFocused = pathname === '/register';
  const showNav = !isAdmin && !isFocused;

  // Nothing to announce once registration is live, and the organizer pages
  // aren't being sold to either.
  const announceOpening = showNav && !REGISTRATION_OPEN && REGISTRATION_OPENS_DATE !== '';

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <>
      {/* The pink bar doubles as the announcement slot: once a date is set in
          site.ts it carries the opening date on every public page, and it goes
          back to being decorative the day registration opens. */}
      {announceOpening ? (
        <div className="bg-pink">
          <p className="mx-auto max-w-7xl px-4 py-2 text-center font-body text-xs font-bold uppercase tracking-widest text-white sm:px-6">
            Registration opens {REGISTRATION_OPENS_DATE} —{' '}
            <Link href="/register" className="underline underline-offset-2 hover:text-blush">
              join the waitlist
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-pink py-1.5" aria-hidden="true" />
      )}

      <header
        className={
          isFocused
            ? 'border-b border-line bg-paper'
            : 'sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm'
        }
      >
        {/* On admin, a three-column grid with an empty first cell so the
            wordmark is centred against the viewport, not against the menu. */}
        <div
          className={
            showNav
              ? 'mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6'
              : isFocused
                ? 'mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-6'
                : 'mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-6'
          }
        >
          {!showNav && <span aria-hidden="true" />}

          <Link
            href="/"
            // 25% larger on admin: 16→20px, and 18→22.5px from the sm breakpoint.
            className={
              isAdmin
                ? 'font-display text-[20px] uppercase tracking-wide text-ink transition-colors hover:text-pink sm:text-[22.5px]'
                : 'font-display text-base uppercase tracking-wide text-ink transition-colors hover:text-pink sm:text-lg'
            }
            aria-label="Race Against Cancers — Home"
          >
            RACE<span className="text-pink">AGAINST</span>CANCERS
          </Link>

          {/* Register button + hamburger */}
          <div className={showNav ? 'flex items-center gap-2 sm:gap-3' : 'flex items-center justify-end'}>
            {showNav && (
              <Link href="/register" className="btn-primary py-3 px-4 text-xs sm:px-5">
                {REGISTRATION_OPEN ? 'Register' : 'Join the Waitlist'}
              </Link>
            )}

            {/* Hamburger */}
            {!isFocused && (
            <div ref={menuRef} className="relative">
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="main-nav"
              className="flex flex-col justify-center gap-[5px] p-2 text-ink transition-colors hover:text-pink"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Dropdown */}
            {open && (
              <nav
                id="main-nav"
                className="absolute right-0 top-full mt-2 w-56 rounded-card border border-line bg-paper shadow-lg"
                aria-label="Primary navigation"
              >
                <ul className="flex flex-col py-2">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block px-5 py-3 font-body text-xs font-semibold uppercase tracking-widest text-ash transition-colors hover:bg-blush hover:text-pink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
