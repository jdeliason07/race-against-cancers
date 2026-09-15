'use server';
import { revalidatePath } from 'next/cache';
import { EVENT_NAME } from '@/config/site';
import { normalizePhone } from '@/lib/phone';
import {
  WAITLIST_SOURCE,
  canonicalEmail,
  findCustomerByEmail,
  getStripe,
} from '@/lib/stripeRegistration';

export type PreSignupResult = { ok: true } | { error: string };

export async function submitPreSignup(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Promise<PreSignupResult> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: 'Service temporarily unavailable. Please email us directly.' };
  }
  if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim() || !data.phone.trim()) {
    return { error: 'First name, last name, email, and phone number are required.' };
  }

  const phone = normalizePhone(data.phone);
  if (!phone) {
    return { error: 'Enter a valid phone number, e.g. (555) 123-4567.' };
  }

  // Idempotent: avoid duplicate records for the same email
  const existing = await findCustomerByEmail(stripe, data.email);
  if (existing) {
    // Someone who signed up before we collected phone numbers — or who is
    // correcting theirs — should still get it saved on their customer record.
    if (existing.phone !== phone) {
      await stripe.customers.update(existing.id, { phone });
    }
    return { ok: true };
  }

  await stripe.customers.create({
    email: canonicalEmail(data.email),
    name: `${data.firstName.trim()} ${data.lastName.trim()}`,
    phone,
    description: `Pre-signup — ${EVENT_NAME}`,
    metadata: {
      source: WAITLIST_SOURCE,
      event: EVENT_NAME,
      submittedAt: new Date().toISOString(),
    },
  });

  revalidatePath('/register');
  return { ok: true };
}
