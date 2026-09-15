'use server';
import Stripe from 'stripe';
import {
  CONTACT_EMAIL,
  EVENT_NAME,
  MAX_PARTICIPANTS_PER_REGISTRATION,
  MIN_DONATION_DOLLARS,
  REFERRAL_ENABLED,
} from '@/config/site';
import { chargeCentsFor } from '@/lib/fees';
import { normalizeSource } from '@/lib/qrSource';
import { ADULT_AGE } from '@/lib/utils';
import {
  canonicalEmail,
  findCustomerByEmail,
  getStripe,
  isRegistered,
} from '@/lib/stripeRegistration';
import { WAIVER_SHORT_TITLE, WAIVER_VERSION } from '@/data/waiver';

interface RegistrationInput {
  raceType: string;
  bandanaColor: string;
  // The donation in cents, e.g. 9900 for $99 (the recommended 10K amount).
  // The card processing fee is added on top here on the server — the client
  // never sends the charge total, so a tampered form can't skip the fee.
  amount: number;
  participantCount: number; // 1 for a solo athlete; more when paying for a group
  firstName: string;
  lastName: string;
  email: string;
  // Whether the athlete will be 18 or older on race day. Required for a solo
  // registration, ignored for a group — the organizer isn't the athlete.
  //
  // This carries exactly the weight the date of birth used to: Section 10 of
  // the Participant Agreement lets a minor take part only with a parent or
  // guardian's consent, so this is what decides whether a guardian has to
  // accept. It is a self-report, as a typed date of birth also was — Section
  // 9 has the participant represent that what they supplied is accurate.
  isAdult: boolean | null;
  guardianName: string; // required when the athlete is under 18 on race day
  waiverAgreed: boolean;
  referredByName: string; // full name of whoever referred them; '' when nobody
  // Which printed QR code this registration came from, e.g. 'dsm' for the plain
  // "DON'T SCAN ME" codes. Attribution only — nothing about the charge depends
  // on it, and it is empty whenever someone arrived by any other route.
  qrSource?: string;
}

/**
 * Attaches the athlete to a Stripe Customer so registrations show up on the
 * Customers page — with a real phone number on the record — instead of living
 * only inside PaymentIntent metadata. Reuses the customer created when they
 * joined the waitlist, if there is one.
 */
async function upsertAthleteCustomer(
  stripe: Stripe,
  existing: Stripe.Customer | null,
  data: RegistrationInput,
): Promise<Stripe.Customer> {
  const name = `${data.firstName.trim()} ${data.lastName.trim()}`;

  if (existing) {
    // Phone is deliberately not in this update. Registration no longer asks
    // for one, and sending an empty string here would erase the number
    // someone gave when they joined the waitlist — the only number we have
    // for them, and the one /admin texts.
    // A partial metadata update merges, so this preserves the waitlist `source`.
    return stripe.customers.update(existing.id, {
      name,
      metadata: { event: EVENT_NAME, startedRegistrationAt: new Date().toISOString() },
    });
  }

  return stripe.customers.create({
    email: canonicalEmail(data.email),
    name,
    description: `Registration — ${EVENT_NAME}`,
    metadata: {
      source: 'registration-form',
      event: EVENT_NAME,
      startedRegistrationAt: new Date().toISOString(),
    },
  });
}

export async function createPaymentIntent(
  registrationData: RegistrationInput,
): Promise<{ clientSecret: string; paymentIntentId: string } | { error: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: 'Payment is not configured yet. Please contact the race organizer.' };
  }

  // The waiver checkbox is enforced in the browser, but this action is
  // reachable by direct POST — so the release is only valid if the server
  // both receives the agreement and records what was actually agreed to.
  if (registrationData.waiverAgreed !== true) {
    return { error: `You must accept the ${WAIVER_SHORT_TITLE} to register.` };
  }

  const participantCount = registrationData.participantCount;
  if (
    !Number.isInteger(participantCount) ||
    participantCount < 1 ||
    participantCount > MAX_PARTICIPANTS_PER_REGISTRATION
  ) {
    return {
      error: `Enter a number of athletes between 1 and ${MAX_PARTICIPANTS_PER_REGISTRATION}. Email ${CONTACT_EMAIL} for a larger group.`,
    };
  }
  const isGroup = participantCount > 1;

  // The age question describes an athlete, so it is only asked of a solo
  // registration. A group organizer registers a headcount, and each athlete
  // answers for themselves at check-in.
  let isMinor = false;

  if (!isGroup) {
    if (typeof registrationData.isAdult !== 'boolean') {
      return { error: `Tell us whether the athlete will be ${ADULT_AGE} or older on race day.` };
    }
    isMinor = !registrationData.isAdult;
    if (isMinor && !registrationData.guardianName.trim()) {
      return {
        error:
          'Athletes under 18 on race day need a parent or legal guardian to accept the waiver on their behalf.',
      };
    }
  }

  // There is no donation minimum — any amount registers an athlete. What the
  // server still has to reject is an amount Stripe itself cannot charge, since
  // this action is reachable by direct POST with anything in the field.
  const floorCents = MIN_DONATION_DOLLARS * 100;
  if (!Number.isInteger(registrationData.amount) || registrationData.amount < floorCents) {
    return {
      error: `Enter a donation of at least $${MIN_DONATION_DOLLARS}.`,
    };
  }

  // What the card is actually charged: the donation plus the fee Stripe takes,
  // so the full donation reaches the charity. Disclosed under the payment
  // fields on step 3 before anything is confirmed.
  const donationCents = registrationData.amount;
  const chargeCents = chargeCentsFor(donationCents);
  const feeCents = chargeCents - donationCents;

  try {
    const existingCustomer = await findCustomerByEmail(stripe, registrationData.email);
    // Group organizers often come back to register themselves, so only a
    // repeated solo registration is treated as a duplicate.
    if (!isGroup && existingCustomer && isRegistered(existingCustomer)) {
      return {
        error: `This email address is already registered. Email ${CONTACT_EMAIL} if you need to change your registration.`,
      };
    }

    const customer = await upsertAthleteCustomer(stripe, existingCustomer, registrationData);

    // Just a name — there's nobody to look up and nothing to validate, so the
    // weekly report groups these by name and you decide what counts.
    const referredByName = REFERRAL_ENABLED
      ? registrationData.referredByName.trim().replace(/\s+/g, ' ').slice(0, 100)
      : '';

    const intent = await stripe.paymentIntents.create({
      amount: chargeCents,
      currency: 'usd',
      customer: customer.id,
      // Enables card + wallet methods (Google Pay / Apple Pay / Link) that are
      // turned on in the Stripe Dashboard, so the Express Checkout button works.
      automatic_payment_methods: { enabled: true },
      receipt_email: canonicalEmail(registrationData.email),
      description: isGroup
        ? `${EVENT_NAME} — ${registrationData.raceType} × ${participantCount}`
        : `${EVENT_NAME} — ${registrationData.raceType}`,
      metadata: {
        event: EVENT_NAME,
        // The charge is donation + fee, so the two are recorded separately —
        // every total we report (the public thermometer, the admin dashboard)
        // counts the donation, not the cut Stripe keeps.
        donationCents: String(donationCents),
        feeCents: String(feeCents),
        raceType: registrationData.raceType,
        bandanaColor: registrationData.bandanaColor,
        firstName: registrationData.firstName.trim(),
        lastName: registrationData.lastName.trim(),
        email: canonicalEmail(registrationData.email),
        participantCount: String(participantCount),
        // Date of birth and emergency contact are collected at check-in now,
        // so they are absent here rather than empty — the webhook defaults
        // them, and check-in fills them in.
        adultOnRaceDay: isGroup ? '' : String(!isMinor),
        isMinor: String(isMinor),
        guardianName: isMinor ? registrationData.guardianName.trim() : '',
        waiverAgreed: 'true',
        waiverAgreedBy: isGroup
          ? 'group organizer'
          : isMinor
            ? registrationData.guardianName.trim()
            : 'athlete',
        waiverAgreedAt: new Date().toISOString(),
        waiverVersion: WAIVER_VERSION,
        // Copied onto the customer by the webhook, so a referral only counts
        // once the payment actually succeeds.
        referredByName,
        // Which QR code produced this. Scans are easy to count and tell you
        // nothing; this is the number that says which poster was worth
        // printing again.
        qrSource: normalizeSource(registrationData.qrSource),
      },
    });

    return { clientSecret: intent.client_secret!, paymentIntentId: intent.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error creating payment.';
    return { error: message };
  }
}
