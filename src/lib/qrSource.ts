/**
 * Campaign attribution for the printed QR codes.
 *
 * Every code carries its own `?s=` value — `/registration?s=dsm` for the plain
 * "DON'T SCAN ME" ones, `/registration?s=gym` for a poster in the gym. The code
 * is remembered for the browser session and written onto the Stripe record at
 * checkout, so `/admin` can report which poster produced *registrations* rather
 * than which produced scans. Scans are vanity; registrations are the campaign.
 *
 * Deliberately sessionStorage rather than a cookie: it is first-party, it dies
 * with the tab, and it needs no consent banner. The trade-off is that someone
 * who scans, leaves, and comes back later is attributed to their second visit —
 * acceptable for a one-day launch, and honest about what it measures.
 */

const KEY = 'rac_qr_source';

/** Lowercase, short, and safe to put in Stripe metadata or a URL. */
export function normalizeSource(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
}

/**
 * Reads `?s=` off the current URL and remembers it. Safe to call on every
 * mount: a later visit without `?s=` keeps whichever code brought them in.
 * Returns the code in force, which may be one stored by an earlier page.
 */
export function captureSource(): string {
  if (typeof window === 'undefined') return '';
  try {
    const fromUrl = normalizeSource(new URLSearchParams(window.location.search).get('s'));
    if (fromUrl) {
      window.sessionStorage.setItem(KEY, fromUrl);
      return fromUrl;
    }
    return window.sessionStorage.getItem(KEY) ?? '';
  } catch {
    // Private browsing and blocked site data both throw here. Attribution is a
    // nice-to-have; nothing about registering may depend on it.
    return '';
  }
}

/** The stored code, for the checkout call. Never throws. */
export function readSource(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.sessionStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}
