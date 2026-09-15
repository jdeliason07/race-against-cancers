// Stripe webhook — the authoritative record that a registration completed.
//
// The browser tells us a payment succeeded, but that signal is lost if the
// athlete closes the tab, loses signal, or pays with a method that redirects
// away and back. Stripe delivers this event server-to-server regardless, and
// retries until we return a 2xx, so this is what marks someone registered.
//
// Setup: Stripe Dashboard → Developers → Webhooks → add endpoint
//   URL:    https://<your-domain>/api/stripe/webhook
//   Events: payment_intent.succeeded
// Then copy the signing secret into STRIPE_WEBHOOK_SECRET.
import type Stripe from 'stripe';
import { revalidatePath } from 'next/cache';
import { EVENT_NAME } from '@/config/site';
import { donationCentsOf, getStripe } from '@/lib/stripeRegistration';

/**
 * Copies the registration details onto the Stripe Customer and flags it as
 * registered, so the Customers page is a complete roster and the spots counter
 * stops counting this person as a waitlist signup as well as a registrant.
 */
async function recordSuccessfulRegistration(
  stripe: Stripe,
  intent: Stripe.PaymentIntent,
): Promise<void> {
  if (intent.metadata?.event !== EVENT_NAME) return;

  const customerId =
    typeof intent.customer === 'string' ? intent.customer : intent.customer?.id;
  if (!customerId) return;

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return;

  // Stripe retries and can deliver the same event more than once.
  if (customer.metadata?.registeredPaymentIntent === intent.id) return;

  const chargedCents = intent.amount_received || intent.amount;
  const donatedCents = donationCentsOf(intent);

  await stripe.customers.update(customerId, {
    metadata: {
      registered: 'true',
      registeredAt: new Date().toISOString(),
      registeredPaymentIntent: intent.id,
      raceType: intent.metadata.raceType ?? '',
      bandanaColor: intent.metadata.bandanaColor ?? '',
      // The donation in cents, without the card fee the registrant covered —
      // `cardFeeAmount` keeps that visible, and the two add up to what their
      // statement shows.
      donationAmount: String(donatedCents),
      cardFeeAmount: String(chargedCents - donatedCents),
      // How many bibs this registration is owed at check-in.
      participantCount: intent.metadata.participantCount ?? '1',
      // Registration asks whether the athlete is 18+ on race day, not for a
      // date. These three stay on the record as blanks for check-in to fill
      // in — that is where the exact date and the emergency contact are now
      // collected, an hour before anyone runs.
      dob: intent.metadata.dob ?? '',
      emergencyName: intent.metadata.emergencyName ?? '',
      emergencyPhone: intent.metadata.emergencyPhone ?? '',
      adultOnRaceDay: intent.metadata.adultOnRaceDay ?? '',
      isMinor: intent.metadata.isMinor ?? '',
      guardianName: intent.metadata.guardianName ?? '',
      waiverAgreedBy: intent.metadata.waiverAgreedBy ?? '',
      waiverAgreedAt: intent.metadata.waiverAgreedAt ?? '',
      waiverVersion: intent.metadata.waiverVersion ?? '',
      // Writing the referral here — rather than when the intent was created —
      // is what makes it count only for a completed registration. The weekly
      // report counts these records, never a running tally, so a duplicate
      // webhook delivery can't inflate anyone's total.
      referredByName: intent.metadata.referredByName ?? '',
    },
  });

  // Stripe emails the receipt via `receipt_email` on the PaymentIntent. This is
  // the place to add a custom confirmation email if you ever want one.

  revalidatePath('/register');
  revalidatePath('/');
}

export async function POST(request: Request): Promise<Response> {
  const stripe = getStripe();
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !signingSecret) {
    return new Response('Stripe webhook is not configured.', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header.', { status: 400 });
  }

  // Signature verification needs the exact bytes Stripe signed, so read the
  // raw body — anyone can POST here, and only a valid signature proves it
  // came from Stripe.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, signingSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Signature verification failed: ${message}`, { status: 400 });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      await recordSuccessfulRegistration(stripe, event.data.object);
    }
  } catch (err) {
    // 5xx tells Stripe to retry — better than dropping a paid registration.
    console.error(`Stripe webhook handler failed for ${event.type} (${event.id}):`, err);
    return new Response('Webhook handler failed.', { status: 500 });
  }

  return Response.json({ received: true });
}
