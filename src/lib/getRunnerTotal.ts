import { athleteCountOf, eachEventCustomer, getStripe } from '@/lib/stripeRegistration';

/**
 * How many athletes are signed up for this event — the number on the home page
 * tracker.
 *
 * Counted off customers rather than payments, because a runner is a runner
 * whether their entry was paid for or comped, and because a single payment can
 * cover a whole group.
 */
export async function getRunnerTotal(): Promise<number> {
  const stripe = getStripe();
  if (!stripe) return 0;

  try {
    let runners = 0;

    await eachEventCustomer(stripe, (customer) => {
      // Waitlist sign-ups share the event tag but haven't registered, so only
      // the completed registrations count toward the goal.
      if (customer.metadata?.registered === 'true') runners += athleteCountOf(customer);
    });

    return runners;
  } catch {
    return 0;
  }
}
