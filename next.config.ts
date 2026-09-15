import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
