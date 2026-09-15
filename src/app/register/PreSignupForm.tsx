'use client';
import { useState } from 'react';
import { submitPreSignup } from './presignup-actions';
import { REFERRAL_ENABLED, REFERRAL_REWARD, REGISTRATION_OPENS_DATE } from '@/config/site';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export function PreSignupForm() {
  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', phone: '',
  });
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError('');
    const result = await submitPreSignup(form);
    setPending(false);
    if ('error' in result) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="rounded-card border-2 border-pink bg-blush p-10 text-center">
        <p className="font-display text-3xl uppercase text-ink mb-4">You&rsquo;re on the list!</p>
        <p className="font-body text-base text-ash">
          We&rsquo;ll email and text you as soon as registration opens
          {REGISTRATION_OPENS_DATE ? ` around ${REGISTRATION_OPENS_DATE}` : ''}.
        </p>
        {REFERRAL_ENABLED && (
          <p className="mt-4 font-body text-sm text-ash">
            <span className="font-bold text-ink">Bring a friend when it does:</span> every friend
            who registers and puts your name in the &ldquo;Who referred you?&rdquo; box earns you
            a {REFERRAL_REWARD} — unlimited.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <p className="font-body text-sm text-ash/70">
        Add your details and we&rsquo;ll reach out the moment registration opens.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="font-body text-xs font-semibold uppercase tracking-widest text-ash">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            required
            autoComplete="given-name"
            placeholder="Jane"
            value={form.firstName}
            onChange={update('firstName')}
            className="rounded-pill border border-line bg-paper px-6 py-4 font-body text-base text-ink placeholder:text-ash/60 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/15"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="font-body text-xs font-semibold uppercase tracking-widest text-ash">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            required
            autoComplete="family-name"
            placeholder="Smith"
            value={form.lastName}
            onChange={update('lastName')}
            className="rounded-pill border border-line bg-paper px-6 py-4 font-body text-base text-ink placeholder:text-ash/60 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/15"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-body text-xs font-semibold uppercase tracking-widest text-ash">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="jane@example.com"
          value={form.email}
          onChange={update('email')}
          className="rounded-pill border border-line bg-paper px-6 py-4 font-body text-base text-ink placeholder:text-ash/60 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="font-body text-xs font-semibold uppercase tracking-widest text-ash">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="(555) 123-4567"
          value={form.phone}
          onChange={update('phone')}
          aria-describedby="phone-hint"
          className="rounded-pill border border-line bg-paper px-6 py-4 font-body text-base text-ink placeholder:text-ash/60 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/15"
        />
        <p id="phone-hint" className="font-body text-xs text-ash/70">
          So we can text you when registration opens. We won&rsquo;t use it for anything else.
        </p>
      </div>

      {error && (
        <p role="alert" className="font-body text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary mt-2 py-5 text-base disabled:opacity-60"
      >
        {pending ? 'Submitting…' : 'Join the Waitlist'}
      </button>
    </form>
  );
}
