import { DONATION_TOTAL_OVERRIDE } from '@/config/site';
import { donationCentsOf, eachEventIntent, getStripe } from '@/lib/stripeRegistration';

export async function getDonationTotal(): Promise<number> {
  // A manually maintained figure wins over the live one, for money raised
  // outside this site's checkout. See DONATION_TOTAL_OVERRIDE in config/site —
  // null there, and the total goes back to being read from Stripe.
  if (DONATION_TOTAL_OVERRIDE !== null) return DONATION_TOTAL_OVERRIDE;

  const stripe = getStripe();
  if (!stripe) return 0;

  try {
    let total = 0;

    // Only money actually received — abandoned and failed checkouts leave
    // PaymentIntents behind that shouldn't count. And only the donation part
    // of each charge: the card fee registrants cover on top goes to Stripe,
    // so counting it would overstate what was raised.
    await eachEventIntent(stripe, (intent) => {
      if (intent.status === 'succeeded') total += donationCentsOf(intent);
    });

    return Math.floor(total / 100); // convert cents to dollars
  } catch {
    return 0;
  }
}
