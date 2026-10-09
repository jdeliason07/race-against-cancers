import Image from 'next/image';
import {
  REFERRAL_ENABLED,
  REFERRAL_REWARD,
  REFERRAL_REWARD_LOGO,
  REFERRAL_REWARD_LOGO_ALT,
  REFERRAL_REWARD_LOGO_HEIGHT,
  REFERRAL_REWARD_LOGO_WIDTH,
  REGISTRATION_OPEN,
} from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * Referral incentive UI, in two placements: the callout wrapped around the
 * "Who referred you?" field at checkout, and the announcement banner on the
 * home page.
 *
 * Both render nothing when REFERRAL_REWARD is "", so switching the program off
 * in src/config/site.ts removes every placement without touching a page.
 */

/**
 * The sponsor mark. Sized by the caller through `className` (a width utility)
 * — the intrinsic dimensions from config are what Next.js uses to reserve
 * space and pick a srcset, not the size it's drawn at. Renders nothing when
 * REFERRAL_REWARD_LOGO is "".
 */
function RewardLogo({ className }: { className?: string }) {
  if (!REFERRAL_REWARD_LOGO) return null;

  return (
    <Image
      src={REFERRAL_REWARD_LOGO}
      alt={REFERRAL_REWARD_LOGO_ALT}
      width={REFERRAL_REWARD_LOGO_WIDTH}
      height={REFERRAL_REWARD_LOGO_HEIGHT}
      sizes="(min-width: 768px) 128px, 96px"
      className={cn('h-auto shrink-0 object-contain', className)}
    />
  );
}

/**
 * Wraps the referral field at checkout. Takes the input as children so the
 * form keeps ownership of its own field styling.
 */
export function ReferralRewardCallout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  if (!REFERRAL_ENABLED) return null;

  return (
    <div className={cn('rounded-card border-2 border-petal bg-mist p-5', className)}>
      <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <RewardLogo className="w-24" />
        <div>
          <p className="font-display text-lg uppercase leading-tight text-ink">
            Get your friend a {REFERRAL_REWARD}
          </p>
          <p className="font-body text-sm text-ash">
            Name whoever told you about the race and we&rsquo;ll send them one.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * Home page announcement. The copy adapts to the registration gate so it reads
 * correctly both while the waitlist is up and once registration goes live.
 */
export function ReferralAnnouncement({ className }: { className?: string }) {
  if (!REFERRAL_ENABLED) return null;

  return (
    <p
      className={cn(
        'mx-auto max-w-3xl rounded-card border border-petal bg-paper px-6 py-3 text-center font-body text-sm text-ash',
        className,
      )}
    >
      <span className="font-bold text-pink">Bring a friend:</span>{' '}
      when they name you in the &ldquo;Who referred you?&rdquo; box
      {REGISTRATION_OPEN ? '' : ' once registration opens'}, you get a {REFERRAL_REWARD}. No limit.
    </p>
  );
}
