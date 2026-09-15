'use server';
import { revalidatePath } from 'next/cache';
import { EVENT_NAME } from '@/config/site';
import { normalizePhone } from '@/lib/phone';
import { normalizeSource } from '@/lib/qrSource';
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
  // Which printed QR code brought them here, when we know. Attribution only.
  qrSource?: string;
  // 'waitlist' before registration opened, 'remind' for someone who scanned a
  // code afterwards and wasn't ready to finish. Both belong to the same
  // mailing list — the distinction is for reporting, not for routing.
  variant?: 'waitlist' | 'remind';
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

  // `source` stays WAITLIST_SOURCE for both variants on purpose: /admin's
  // waitlist panel and its email composer both query on it, so a separate
  // source would quietly hide these people from the very list they joined to
  // be on. The variant is recorded alongside it instead.
  await stripe.customers.create({
    email: canonicalEmail(data.email),
    name: `${data.firstName.trim()} ${data.lastName.trim()}`,
    phone,
    description: `Pre-signup — ${EVENT_NAME}`,
    metadata: {
      source: WAITLIST_SOURCE,
      capturedVia: data.variant === 'remind' ? 'register-remind' : 'waitlist',
      qrSource: normalizeSource(data.qrSource),
      event: EVENT_NAME,
      submittedAt: new Date().toISOString(),
    },
  });

  revalidatePath('/register');
  return { ok: true };
}
