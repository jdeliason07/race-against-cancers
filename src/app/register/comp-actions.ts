'use server';
import { CONTACT_EMAIL, EVENT_NAME } from '@/config/site';
import { normalizePhone } from '@/lib/phone';
import { ADULT_AGE, ageOnRaceDay, isPlausibleDob } from '@/lib/utils';
import {
  canonicalEmail,
  findCustomerByEmail,
  getStripe,
  isRegistered,
} from '@/lib/stripeRegistration';
import { checkCompCode, compMetadata } from '@/lib/compRegistration';
import { WAIVER_SHORT_TITLE, WAIVER_VERSION } from '@/data/waiver';

/**
 * Registers one athlete against a sponsor-funded block. No payment is taken,
 * so there is no PaymentIntent and no webhook — this writes the completed
 * registration to the customer record directly.
 *
 * Every athlete detail the paid flow collects is still required here. That's
 * the point: a covered block would otherwise arrive as a headcount with no
 * names and no signed waivers.
 */
export async function submitCompRegistration(data: {
  code: string;
  raceType: string;
  bandanaColor: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  emergencyName: string;
  emergencyPhone: string;
  guardianName: string;
  waiverAgreed: boolean;
}): Promise<{ ok: true } | { error: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: 'Registration is not configured yet. Please contact the race organizer.' };
  }

  // Re-check the code on submit, not just when the page loaded — the link is
  // the only thing standing between this action and free entries.
  const comp = await checkCompCode(stripe, data.code);
  if (!comp) {
    return {
      error: `This registration link is no longer valid or all of its entries have been claimed. Email ${CONTACT_EMAIL} and we'll help.`,
    };
  }

  if (data.waiverAgreed !== true) {
    return { error: `You must accept the ${WAIVER_SHORT_TITLE} to register.` };
  }
  if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim()) {
    return { error: 'First name, last name, and email are required.' };
  }
  if (!data.bandanaColor) {
    return { error: 'Choose a bandana color to continue.' };
  }
  if (data.raceType !== '10k' && data.raceType !== 'fun-run') {
    return { error: 'Choose which race you want to run.' };
  }

  const phone = normalizePhone(data.phone);
  if (!phone) {
    return { error: 'Enter a valid phone number, e.g. (555) 123-4567.' };
  }
  const emergencyPhone = normalizePhone(data.emergencyPhone);
  if (!emergencyPhone) {
    return { error: 'Enter a valid emergency contact phone number.' };
  }
  if (!data.emergencyName.trim()) {
    return { error: 'Enter an emergency contact name.' };
  }
  if (!isPlausibleDob(data.dob)) {
    return { error: 'Enter a valid date of birth.' };
  }

  const age = ageOnRaceDay(data.dob)!;
  const isMinor = age < ADULT_AGE;
  if (isMinor && !data.guardianName.trim()) {
    return {
      error:
        'Athletes under 18 on race day need a parent or legal guardian to accept the waiver on their behalf.',
    };
  }

  try {
    const existing = await findCustomerByEmail(stripe, data.email);
    if (existing && isRegistered(existing)) {
      return {
        error: `This email address is already registered. Email ${CONTACT_EMAIL} if you need to change your registration.`,
      };
    }

    const name = `${data.firstName.trim()} ${data.lastName.trim()}`;
    const details: Record<string, string> = {
      ...compMetadata(comp.code),
      registered: 'true',
      registeredAt: new Date().toISOString(),
      raceType: data.raceType,
      bandanaColor: data.bandanaColor,
      participantCount: '1',
      dob: data.dob,
      isMinor: String(isMinor),
      guardianName: isMinor ? data.guardianName.trim() : '',
      emergencyName: data.emergencyName.trim(),
      emergencyPhone,
      waiverAgreedBy: isMinor ? data.guardianName.trim() : 'athlete',
      waiverAgreedAt: new Date().toISOString(),
      waiverVersion: WAIVER_VERSION,
      // Deliberately no referral credit: a free entry shouldn't be able to
      // earn anyone a gift card.
      referredByName: '',
    };

    if (existing) {
      await stripe.customers.update(existing.id, { name, phone, metadata: details });
    } else {
      await stripe.customers.create({
        email: canonicalEmail(data.email),
        name,
        phone,
        description: `Covered registration — ${EVENT_NAME}`,
        metadata: details,
      });
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error completing registration.';
    return { error: message };
  }
}
