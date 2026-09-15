import type { NextConfig } from 'next';

// Every path a printed QR code or a hand-typed URL might plausibly aim at.
// The canonical route is /register; these are the spellings people guess.
// A QR code on a wall cannot be edited after it is printed, so the cost of a
// missing alias is a dead scan and the cost of an extra one is a config line.
const REGISTER_ALIASES = [
  'registration',
  'registrations',
  'signup',
  'sign-up',
  'signmeup',
  'join',
  'reg',
  'r',
  'run',
  'race',
  'scan',
  'dontscanme',
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Bare alias, e.g. /registration -> /register. Query strings ride along,
      // so /registration?s=dsm keeps its campaign code.
      ...REGISTER_ALIASES.map((alias) => ({
        source: `/${alias}`,
        destination: '/register',
        // 307, not 308: a permanent redirect is cached by the browser forever,
        // and one of these paths may well want to become a real page later.
        permanent: false,
      })),
      // Anything nested under an alias, e.g. /registration/step-1.
      ...REGISTER_ALIASES.map((alias) => ({
        source: `/${alias}/:path*`,
        destination: '/register',
        permanent: false,
      })),
    ];
  },
  async headers() {
    return [
      {
        // Apple fetches this file to verify the domain before it will show the
        // Apple Pay button. It has no extension, so it would otherwise be
        // served as a binary download; Apple wants plain text, and never a
        // redirect. The file itself lives in public/.well-known/.
        source: '/.well-known/apple-developer-merchantid-domain-association',
        headers: [{ key: 'Content-Type', value: 'text/plain; charset=utf-8' }],
      },
    ];
  },
};

export default nextConfig;
