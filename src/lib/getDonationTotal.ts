import { OFFLINE_DONATIONS_TOTAL } from '@/config/site';
import { donationCentsOf, eachDonationIntent, getStripe } from '@/lib/stripeRegistration';

export async function getDonationTotal(): Promise<number> {
  return (await stripeDonationDollars()) + OFFLINE_DONATIONS_TOTAL;
}

async function stripeDonationDollars(): Promise<number> {
  const stripe = getStripe();
  if (!stripe) return 0;

  try {
    let total = 0;

    // Only money actually received — abandoned and failed checkouts leave
    // PaymentIntents behind that shouldn't count. And only the donation part
    // of each charge: the card fee registrants cover on top goes to Stripe,
    // so counting it would overstate what was raised.
    await eachDonationIntent(stripe, (intent) => {
      if (intent.status === 'succeeded') total += donationCentsOf(intent);
    });

    return Math.floor(total / 100); // convert cents to dollars
  } catch {
    return 0;
  }
}
