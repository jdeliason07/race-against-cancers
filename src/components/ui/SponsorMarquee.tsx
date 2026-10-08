import Image from 'next/image';
import { SPONSORS } from '@/config/site';

/**
 * Sideways-scrolling sponsor logos. The list is repeated so the strip is
 * always wider than the screen, then doubled so the CSS loop is seamless.
 * Renders nothing until SPONSORS in site.ts has entries.
 */
export function SponsorMarquee() {
  if (SPONSORS.length === 0) return null;

  const repeats = Math.max(1, Math.ceil(8 / SPONSORS.length));
  const row = Array.from({ length: repeats }, () => SPONSORS).flat();
  const track = [...row, ...row];
  const duration = `${row.length * 4}s`;

  return (
    <section aria-label="Our sponsors" className="border-b border-line bg-paper py-8">
      <p className="section-label mb-6 text-center">Thank you to our sponsors</p>
      <div className="sponsor-marquee overflow-hidden">
        <ul
          className="sponsor-track flex w-max items-center"
          style={{ ['--sponsor-duration' as string]: duration }}
        >
          {track.map((s, i) => {
            const hidden = i >= SPONSORS.length;
            const mark = s.logo ? (
              <Image
                src={s.logo}
                alt={s.name}
                width={160}
                height={64}
                className="h-14 w-auto max-w-[150px] object-contain md:h-16"
                unoptimized
              />
            ) : (
              <span className="font-display text-2xl uppercase text-ash">{s.name}</span>
            );
            return (
              <li key={i} className="mx-8 flex shrink-0 items-center md:mx-12" aria-hidden={hidden || undefined}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined}>
                    {mark}
                  </a>
                ) : (
                  mark
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
