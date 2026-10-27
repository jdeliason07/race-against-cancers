import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Sponsor } from '@/data/sponsors';

/**
 * A sponsor's logo, linked to their site, fitted inside a fixed box so a wide
 * wordmark and a round badge come out the same overall size. The caller sets
 * the box with `className` (height and width); the logo is contained, never
 * cropped or stretched, and always in full color.
 */
export function SponsorLogo({
  sponsor,
  className,
  tile = false,
  card = false,
}: {
  sponsor: Sponsor;
  className?: string;
  /** Sit the logo on a white card with a hairline border. */
  tile?: boolean;
  /** On a /sponsors card: use the sponsor's `cardLogo` when they have one. */
  card?: boolean;
}) {
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'relative flex shrink-0 items-center justify-center transition-opacity hover:opacity-80',
        tile && 'rounded-card border border-line bg-paper p-3',
        className,
      )}
    >
      <span className="relative block h-full w-full">
        <Image
          src={card && sponsor.cardLogo ? sponsor.cardLogo : sponsor.logo}
          alt={sponsor.name}
          fill
          sizes="240px"
          className="object-contain"
          unoptimized
        />
      </span>
    </a>
  );
}
