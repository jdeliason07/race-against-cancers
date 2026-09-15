'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { createPaymentIntent } from './actions';
import { submitCompRegistration } from './comp-actions';
import { ADULT_AGE, isMinorOnRaceDay, isPlausibleDob } from '@/lib/utils';
import { captureSource, readSource } from '@/lib/qrSource';
import {
  DONATION_PRESETS_10K,
  DONATION_PRESETS_FUN_RUN,
  MAX_PARTICIPANTS_PER_REGISTRATION,
  MIN_DONATION_DOLLARS,
  TEN_K_LABEL,
  FUN_RUN_LABEL,
  REFERRAL_ENABLED,
  STRIPE_FEE_LABEL,
} from '@/config/site';
import { ReferralRewardCallout } from '@/components/ui/ReferralReward';
import { WaiverText } from '@/components/legal/WaiverText';
import {
  WAIVER_ACCEPTANCE_ADULT,
  WAIVER_ACCEPTANCE_GUARDIAN,
  WAIVER_SHORT_TITLE,
} from '@/data/waiver';

// Loaded on demand rather than at module scope. This is the QR landing page's
// bundle: fetching Stripe.js for every curious scanner who never reaches the
// payment step costs them a round-trip on whatever signal they are standing in,
// and most of them will never need it. Cached after the first call, so stepping
// back and forth between steps does not re-fetch.
let stripeJs: ReturnType<typeof loadStripe> | null = null;
function getStripeJs() {
  if (!stripeJs) stripeJs = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return stripeJs;
}

const stripeAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#F0307A',
    colorBackground: '#FFFFFF',
    colorText: '#1C1719',
    colorTextSecondary: '#6E5C64',
    colorDanger: '#c81a1a',
    fontFamily: '"Saira", system-ui, sans-serif',
    borderRadius: '14px',
  },
  rules: {
    '.Input': {
      border: '1px solid #ECE2E6',
      boxShadow: 'none',
      padding: '12px 14px',
    },
    '.Input:focus': {
      border: '1px solid #F0307A',
      outline: '2px solid rgba(240,48,122,0.15)',
      boxShadow: 'none',
    },
    '.Label': {
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontSize: '11px',
      color: '#6E5C64',
      marginBottom: '6px',
    },
    '.Error': {
      color: '#c81a1a',
      fontSize: '12px',
    },
  },
};

type Step = 1 | 2 | 3 | 4;
type RaceType = '10k' | 'fun-run' | null;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  emergencyName: string;
  emergencyPhone: string;
  guardianName: string;
  referredByName: string;
}

// Step progress indicator
function StepIndicator({ step, labels }: { step: Step; labels: string[] }) {
  const total = labels.length;
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-body text-xs font-bold uppercase tracking-widest text-ash">
          Step {step} of {total} — {labels[step - 1]}
        </p>
        <p className="font-body text-xs text-ash">{Math.round((step / total) * 100)}%</p>
      </div>
      <div className="flex gap-2">
        {labels.map((_, i) => i + 1).map((s) => (
          <div
            key={s}
            className="h-1.5 flex-1 rounded-pill"
            style={{
              backgroundColor: s <= step ? '#F0307A' : '#ECE2E6',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Step 1 — Race Selection.
//
// One tap, not two: picking a race also advances, so there is no separate Next
// button to find and no disabled state to puzzle over. The race is still
// changeable from step 2's Back button, which is the only thing the old
// select-then-confirm pattern was buying.
function StepRaceSelection({
  setRaceType,
  onNext,
}: {
  setRaceType: (r: RaceType) => void;
  onNext: () => void;
}) {
  const races = [
    { key: '10k' as const,     label: '10K' },
    { key: 'fun-run' as const, label: 'Fun Run' },
  ];

  return (
    <div className="rounded-card border-2 border-pink bg-blush p-6 text-center">
      <h2 className="font-display text-2xl uppercase leading-tight text-ink">
        Ready when you are
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {races.map((race) => (
          <button
            key={race.key}
            type="button"
            onClick={() => {
              setRaceType(race.key);
              onNext();
            }}
            className="btn-primary w-full"
          >
            Register for the {race.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const bandanaOptions = [
  { label: 'Breast Cancer',     color: '#F0307A' },
  { label: 'Leukemia',          color: '#DC2626' },
  { label: 'Pancreatic Cancer', color: '#9333EA' },
  { label: 'Colon Cancer',      color: '#2563EB' },
  { label: 'Melanoma',          color: '#111111' },
  { label: 'Childhood Cancer',  color: '#EAB308' },
  { label: 'Lung Cancer',       color: '#9CA3AF' },
  { label: 'Lymphoma',          color: '#16A34A' },
];

// Step 2 — Athlete Info + Donation + Waiver
function StepAthleteInfo({
  formData,
  setFormData,
  bandanaColor,
  setBandanaColor,
  donationAmount,
  donationPresets,
  presetIndex,
  setPresetIndex,
  setCustomDonation,
  participantCount,
  setParticipantCount,
  waiverAgreed,
  setWaiverAgreed,
  isComp,
  onNext,
  onBack,
  loading,
}: {
  formData: FormData;
  setFormData: (f: FormData) => void;
  bandanaColor: string;
  setBandanaColor: (c: string) => void;
  donationAmount: number;
  donationPresets: number[];
  presetIndex: number | null;
  setPresetIndex: (i: number | null) => void;
  setCustomDonation: (a: number) => void;
  participantCount: number;
  setParticipantCount: (n: number) => void;
  waiverAgreed: boolean;
  setWaiverAgreed: (v: boolean) => void;
  isComp: boolean;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  // The first rung of the ladder is the recommendation, per athlete.
  const perAthleteRecommended = donationPresets[0];
  const recommendedDonation = perAthleteRecommended * participantCount;

  // One person paying for several athletes is registering a group, not
  // themselves — so the personal fields below become their contact details and
  // each athlete's own details are collected at check-in.
  const isGroup = !isComp && participantCount > 1;

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const touch = (field: keyof FormData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // The waiver requires a parent or legal guardian to accept on behalf of
  // anyone under 18 on race day, so ask for their name once we know the age.
  const isMinor = !isGroup && isMinorOnRaceDay(formData.dob);

  const fieldError = (field: keyof FormData): string | null => {
    if (!touched[field]) return null;
    const val = formData[field].trim();
    if (!val) return 'This field is required.';
    if (field === 'email' && !isEmailValid(formData.email)) return 'Enter a valid email address.';
    if (field === 'dob' && !isPlausibleDob(formData.dob)) return 'Enter a valid date of birth.';
    return null;
  };

  const canAdvance =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    isEmailValid(formData.email) &&
    formData.phone.trim() &&
    // Date of birth and emergency contact belong to an athlete, so they're
    // only asked for when the registration is for one.
    (isGroup ||
      (isPlausibleDob(formData.dob) &&
        formData.emergencyName.trim() &&
        formData.emergencyPhone.trim())) &&
    (!isMinor || formData.guardianName.trim()) &&
    (isComp || donationAmount >= MIN_DONATION_DOLLARS) &&
    bandanaColor !== '' &&
    waiverAgreed;

  const inputClass =
    'border border-line rounded-card px-4 py-3 font-body text-sm text-ink w-full focus:outline-none focus:border-pink';
  const labelClass =
    'font-body text-xs font-bold uppercase tracking-widest text-ash mb-1 block';
  const errorClass = 'mt-1 font-body text-xs text-red-700';

  return (
    <div>
      <h2 className="font-display text-3xl uppercase text-ink mb-6">
        {isGroup ? 'Organizer Info' : 'Athlete Info'}
      </h2>

      {/* Headcount — drives the recommended donation below */}
      {!isComp && (
      <div className="mb-6 rounded-card border border-line bg-mist p-5">
        <label htmlFor="participantCount" className={labelClass}>
          How many athletes are you registering?
        </label>
        <input
          id="participantCount"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_PARTICIPANTS_PER_REGISTRATION}
          value={participantCount}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            const next = Number.isNaN(parsed)
              ? 1
              : Math.min(Math.max(parsed, 1), MAX_PARTICIPANTS_PER_REGISTRATION);
            setParticipantCount(next);
          }}
          className={inputClass + ' bg-white'}
          aria-describedby="participantCount-hint"
        />
        <p id="participantCount-hint" className="mt-2 font-body text-sm text-ash">
          {isGroup
            ? `Covering ${participantCount} athletes at the recommended $${perAthleteRecommended} each — $${recommendedDonation} in all. We'll collect each athlete's name and waiver at check-in.`
            : `Registering more than one? Enter the number here and the recommended donation adjusts — $${perAthleteRecommended} per athlete.`}
        </p>
      </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <div>
          <label htmlFor="firstName" className={labelClass}>First Name</label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={update('firstName')}
            onBlur={touch('firstName')}
            className={inputClass}
            required
            aria-required="true"
            aria-describedby={fieldError('firstName') ? 'firstName-error' : undefined}
          />
          {fieldError('firstName') && <p id="firstName-error" className={errorClass}>{fieldError('firstName')}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>Last Name</label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={update('lastName')}
            onBlur={touch('lastName')}
            className={inputClass}
            required
            aria-required="true"
            aria-describedby={fieldError('lastName') ? 'lastName-error' : undefined}
          />
          {fieldError('lastName') && <p id="lastName-error" className={errorClass}>{fieldError('lastName')}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="email" className={labelClass}>Email Address</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={update('email')}
          onBlur={touch('email')}
          className={inputClass}
          required
          aria-required="true"
          aria-describedby={fieldError('email') ? 'email-error' : undefined}
        />
        {fieldError('email') && <p id="email-error" className={errorClass}>{fieldError('email')}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="phone" className={labelClass}>Phone Number</label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={update('phone')}
          onBlur={touch('phone')}
          className={inputClass}
          required
          aria-required="true"
          aria-describedby={fieldError('phone') ? 'phone-error' : undefined}
        />
        {fieldError('phone') && <p id="phone-error" className={errorClass}>{fieldError('phone')}</p>}
      </div>

      {!isGroup && (
      <>
      <div className="mb-4">
        <label htmlFor="dob" className={labelClass}>Date of Birth</label>
        <input
          id="dob"
          type="date"
          value={formData.dob}
          onChange={update('dob')}
          onBlur={touch('dob')}
          className={inputClass}
          required
          aria-required="true"
          aria-describedby={fieldError('dob') ? 'dob-error' : undefined}
        />
        {fieldError('dob') && <p id="dob-error" className={errorClass}>{fieldError('dob')}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div>
          <label htmlFor="emergencyName" className={labelClass}>Emergency Contact Name</label>
          <input
            id="emergencyName"
            type="text"
            value={formData.emergencyName}
            onChange={update('emergencyName')}
            onBlur={touch('emergencyName')}
            className={inputClass}
            required
            aria-required="true"
            aria-describedby={fieldError('emergencyName') ? 'emergencyName-error' : undefined}
          />
          {fieldError('emergencyName') && <p id="emergencyName-error" className={errorClass}>{fieldError('emergencyName')}</p>}
        </div>
        <div>
          <label htmlFor="emergencyPhone" className={labelClass}>Emergency Contact Phone</label>
          <input
            id="emergencyPhone"
            type="tel"
            value={formData.emergencyPhone}
            onChange={update('emergencyPhone')}
            onBlur={touch('emergencyPhone')}
            className={inputClass}
            required
            aria-required="true"
            aria-describedby={fieldError('emergencyPhone') ? 'emergencyPhone-error' : undefined}
          />
          {fieldError('emergencyPhone') && <p id="emergencyPhone-error" className={errorClass}>{fieldError('emergencyPhone')}</p>}
        </div>
      </div>
      </>
      )}

      {isMinor && (
        <div className="mb-6 rounded-card border border-petal bg-blush p-5">
          <label htmlFor="guardianName" className={labelClass}>Parent or Legal Guardian</label>
          <p className="mb-2 font-body text-sm text-ash">
            This athlete will be under {ADULT_AGE} on race day, so a parent or legal guardian must
            accept the waiver below on their behalf.
          </p>
          <input
            id="guardianName"
            type="text"
            value={formData.guardianName}
            onChange={update('guardianName')}
            onBlur={touch('guardianName')}
            className={inputClass}
            required
            aria-required="true"
            autoComplete="name"
            placeholder="Full name of parent or legal guardian"
            aria-describedby={fieldError('guardianName') ? 'guardianName-error' : undefined}
          />
          {fieldError('guardianName') && <p id="guardianName-error" className={errorClass}>{fieldError('guardianName')}</p>}
        </div>
      )}

      {REFERRAL_ENABLED && !isComp && (
        <ReferralRewardCallout className="mb-6">
          <label htmlFor="referredByName" className={labelClass}>
            Who referred you? <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="referredByName"
            type="text"
            value={formData.referredByName}
            onChange={update('referredByName')}
            className={inputClass}
            autoComplete="off"
            placeholder="First and last name"
            aria-describedby="referredByName-help"
          />
          <p id="referredByName-help" className="mt-2 font-body text-xs text-ash">
            Their full name, spelled the way they&rsquo;d spell it — that&rsquo;s how we match the
            reward to the right person.
          </p>
        </ReferralRewardCallout>
      )}

      {/* Bandana color */}
      <div className="mb-6">
        <p id="bandana-label" className="font-body text-xs font-bold uppercase tracking-widest text-ash mb-3">
          {isGroup
            ? `Which color bandana for your ${participantCount} athletes?`
            : 'Which color bandana will you race with?'}
        </p>
        <div role="group" aria-labelledby="bandana-label" className="grid grid-cols-2 gap-2">
          {bandanaOptions.map((opt) => {
            const selected = bandanaColor === opt.label;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setBandanaColor(opt.label)}
                aria-pressed={selected}
                className="rounded-card border-2 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none"
                style={{
                  borderColor: selected ? opt.color : '#ECE2E6',
                  backgroundColor: selected ? opt.color + '18' : '#FFFFFF',
                }}
              >
                <span
                  className="font-display text-lg uppercase leading-tight"
                  style={{ color: opt.color }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
        {bandanaColor === '' && (
          <p className="mt-2 font-body text-xs text-ash">Select a bandana color to continue.</p>
        )}
      </div>

      {/* Donation amount — the buttons pre-fill it, and any amount is accepted */}
      {!isComp && (
      <div className="mb-6 rounded-card border border-petal bg-blush p-5">
        <p className="mb-2 font-body text-xs font-bold uppercase tracking-widest text-ash">
          Donation Amount
        </p>
        <p className="mb-3 font-body text-sm text-ash">
          {isGroup
            ? `Recommended: $${recommendedDonation} — $${perAthleteRecommended} × ${participantCount} athletes. Give more if you're able.`
            : `Recommended: $${recommendedDonation}. Give more if you're able.`}
        </p>

        {/* One-tap amounts. They're per athlete, so they scale with the
            headcount and the first one always matches the recommendation. */}
        <div className="mb-3 grid grid-cols-3 gap-2" role="group" aria-label="Donation amounts">
          {donationPresets.map((perAthlete, i) => {
            const total = perAthlete * participantCount;
            const selected = presetIndex === i;
            return (
              <button
                key={perAthlete}
                type="button"
                onClick={() => setPresetIndex(i)}
                aria-pressed={selected}
                className="rounded-card border-2 px-3 py-3 text-center transition-colors duration-150 focus-visible:outline-none"
                style={{
                  borderColor: selected ? '#F0307A' : '#F6C9DB',
                  backgroundColor: selected ? '#F0307A' : '#FFFFFF',
                }}
              >
                <span
                  className="block font-display text-xl uppercase"
                  style={{ color: selected ? '#FFFFFF' : '#1C1719' }}
                >
                  ${total}
                </span>
                {i === 0 && (
                  <span
                    className="block font-body text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: selected ? '#FFFFFF' : '#6E5C64' }}
                  >
                    Recommended
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <label htmlFor="donationAmount" className="mb-1 block font-body text-xs text-ash">
          Or enter another amount
        </label>
        <input
          id="donationAmount"
          type="number"
          min={MIN_DONATION_DOLLARS}
          // 0 stands for an empty field, so clearing it doesn't strand a "0"
          // the registrant has to delete before typing their own number.
          value={donationAmount === 0 ? '' : donationAmount}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            // Their number from here on — no button stays lit and the
            // headcount stops moving the amount.
            setPresetIndex(null);
            setCustomDonation(isNaN(val) || val < 0 ? 0 : val);
          }}
          className="border border-petal rounded-card px-4 py-3 font-body text-sm text-ink w-full focus:outline-none focus:border-pink bg-white"
          aria-describedby="donation-amount-hint"
        />
        <p id="donation-amount-hint" className="mt-1 font-body text-xs text-ash sr-only">
          Recommended donation: ${recommendedDonation}. Enter any amount of $
          {MIN_DONATION_DOLLARS} or more.
        </p>
        {donationAmount < MIN_DONATION_DOLLARS && (
          <p className="mt-1 font-body text-xs text-red-700" role="alert">
            Enter a donation of at least ${MIN_DONATION_DOLLARS}.
          </p>
        )}
      </div>
      )}

      {isComp && (
        <div className="mb-6 rounded-card border-2 border-pink bg-blush p-5">
          <p className="font-display text-xl uppercase text-ink">Your entry is covered</p>
          <p className="mt-1 font-body text-sm text-ash">
            A sponsor has already donated on your behalf — there&rsquo;s nothing to pay.
          </p>
        </div>
      )}

      {/* Participant Agreement — the text itself lives in src/data/waiver.ts */}
      <div className="mb-6">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <p className="font-body text-xs font-bold uppercase tracking-widest text-ash">
            {WAIVER_SHORT_TITLE}
          </p>
          <Link
            href="/waiver"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-pink underline underline-offset-2 hover:text-raspberry"
          >
            Open full page
          </Link>
        </div>
        <div
          role="region"
          aria-label="Participant Agreement — scroll to read"
          className="border border-line rounded-card p-4"
          style={{ maxHeight: '260px', overflowY: 'scroll' }}
          tabIndex={0}
        >
          <WaiverText variant="compact" />
        </div>
        <label htmlFor="waiverCheckbox" className="mt-3 flex items-start gap-3 cursor-pointer">
          <input
            id="waiverCheckbox"
            type="checkbox"
            checked={waiverAgreed}
            onChange={(e) => setWaiverAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-pink"
          />
          <span className="font-body text-sm text-ink">
            {isGroup
              ? `I have read and agree to the ${WAIVER_SHORT_TITLE}, and I will make sure every athlete I am registering — or their parent or legal guardian — accepts it before race day`
              : isMinor
                ? WAIVER_ACCEPTANCE_GUARDIAN
                : WAIVER_ACCEPTANCE_ADULT}
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="btn-ghost flex-1"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance || loading}
          className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing…' : isComp ? 'Complete Registration' : 'Next: Payment'}
        </button>
      </div>
    </div>
  );
}

// Inner payment form (must be inside <Elements>)
function PaymentForm({
  raceType,
  formData,
  donationAmount,
  participantCount,
  bandanaColor,
  onSuccess,
  onBack,
}: {
  raceType: RaceType;
  formData: FormData;
  donationAmount: number;
  participantCount: number;
  bandanaColor: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  // 'pending' until Stripe reports back which wallets this browser can use.
  // The container is kept in the layout (just invisible) while pending —
  // mounting the Express Checkout Element inside a `display: none` parent can
  // leave the Apple Pay button unable to measure itself and it never appears.
  // Once we know, it either shows or collapses.
  const [expressState, setExpressState] = useState<'pending' | 'available' | 'unavailable'>(
    'pending',
  );
  const expressAvailable = expressState === 'available';

  // Shared by the card form and the Express Checkout
  // (Google Pay / Apple Pay / Link) button.
  const confirmStripe = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/register' },
      redirect: 'if_required',
    });

    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else if (error) {
      setPaymentError(error.message ?? 'Payment failed. Please try again.');
      setSubmitting(false);
    } else {
      setSubmitting(false);
    }
  };

  const raceLabel = raceType === '10k' ? TEN_K_LABEL : FUN_RUN_LABEL;
  return (
    <div>
      {/* Summary bar */}
      <div className="mb-6 rounded-card border border-line bg-mist p-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-body text-sm text-ink">
          <span>
            <span className="font-bold">Race:</span> {raceLabel}
          </span>
          <span>
            <span className="font-bold">Name:</span> {formData.firstName} {formData.lastName}
          </span>
          {participantCount > 1 && (
            <span>
              <span className="font-bold">Athletes:</span> {participantCount}
            </span>
          )}
          <span>
            <span className="font-bold">Donation:</span> ${donationAmount}
            <a
              href="#card-fee-note"
              className="font-bold text-pink no-underline"
              aria-label="See the note about the card processing fee"
            >
              *
            </a>
          </span>
          <span>
            <span className="font-bold">Bandana:</span> {bandanaColor}
          </span>
        </div>
      </div>

      <h2 className="font-display text-3xl uppercase text-ink mb-6">Payment</h2>

          {/* Express Checkout — prominent Apple Pay / Google Pay / Link buttons */}
          <div
            className={
              expressState === 'available'
                ? 'mb-2'
                : expressState === 'unavailable'
                  ? 'hidden'
                  : 'invisible'
            }
          >
            <ExpressCheckoutElement
              options={{
                // Apple Pay only renders where the browser supports it (Safari,
                // and Chrome/Edge on macOS). 'always' is what keeps the button
                // there for someone who supports Apple Pay but has no card in
                // their Wallet yet — tapping it walks them through adding one,
                // instead of the button silently vanishing.
                paymentMethods: { applePay: 'always' },
              }}
              // `availablePaymentMethods` is undefined when no wallet is
              // usable; when it is present, check the flags rather than the
              // object, since an object with every wallet false is still truthy.
              onReady={({ availablePaymentMethods }) =>
                setExpressState(
                  availablePaymentMethods &&
                    Object.values(availablePaymentMethods).some(Boolean)
                    ? 'available'
                    : 'unavailable',
                )
              }
              onConfirm={confirmStripe}
            />
          </div>
          {expressAvailable && (
            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-line" />
              <span className="font-body text-xs uppercase tracking-widest text-ash">or pay with card</span>
              <span className="h-px flex-1 bg-line" />
            </div>
          )}

          <div className="mb-6">
            <PaymentElement
              options={{
                // Tabs layout shows the card fields directly with the other
                // methods as a simple list — instead of the accordion that
                // collapses into a recognized Link account. Wallets (Link /
                // Google Pay / Apple Pay) already live in the Express Checkout
                // button above, so suppress them here to avoid duplication.
                layout: 'tabs',
                wallets: { applePay: 'never', googlePay: 'never', link: 'never' },
              }}
            />
          </div>

          {/* What the asterisk on the donation in the summary bar points at. */}
          <p id="card-fee-note" className="mb-6 font-body text-xs leading-relaxed text-ash">
            <span aria-hidden="true">*</span> Plus {STRIPE_FEE_LABEL} Credit Card Fee
          </p>

          {paymentError && (
            <p className="mb-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700" role="alert">
              {paymentError}
            </p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onBack} disabled={submitting} className="btn-ghost flex-1">
              Back
            </button>
            <button
              type="button"
              onClick={confirmStripe}
              disabled={submitting || !stripe || !elements}
              className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing…' : 'Complete Registration'}
            </button>
          </div>
    </div>
  );
}

// Step 3 — Payment (wrapper that provides Elements context)
function StepPayment({
  clientSecret,
  raceType,
  formData,
  donationAmount,
  participantCount,
  bandanaColor,
  onSuccess,
  onBack,
}: {
  clientSecret: string;
  raceType: RaceType;
  formData: FormData;
  donationAmount: number;
  participantCount: number;
  bandanaColor: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  return (
    <Elements
      stripe={getStripeJs()}
      options={{ clientSecret, appearance: stripeAppearance }}
    >
      <PaymentForm
        raceType={raceType}
        formData={formData}
        donationAmount={donationAmount}
        participantCount={participantCount}
        bandanaColor={bandanaColor}
        onSuccess={onSuccess}
        onBack={onBack}
      />
    </Elements>
  );
}

// Step 4 — Confirmation
function StepConfirmation({
  raceType,
  formData,
  donationAmount,
  participantCount,
  bandanaColor,
  isComp,
}: {
  raceType: RaceType;
  formData: FormData;
  donationAmount: number;
  participantCount: number;
  bandanaColor: string;
  isComp: boolean;
}) {
  const isGroup = participantCount > 1;
  const raceLabel = raceType === '10k' ? TEN_K_LABEL : FUN_RUN_LABEL;

  return (
    <div className="text-center">
      {/* Success checkmark */}
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: '#FDE7F0' }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F0307A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="font-display text-4xl uppercase text-ink mb-2">
        You’re Registered!
      </h2>
      <p className="font-body text-base text-ash mb-8">
        Thank you for signing up for Race Against Cancers 2026.
      </p>

      {/* Summary */}
      <div className="mb-8 rounded-card border border-line bg-mist p-6 text-left">
        <dl className="space-y-3 font-body text-sm">
          <div className="flex justify-between">
            <dt className="font-bold uppercase tracking-widest text-ash text-xs">Name</dt>
            <dd className="text-ink">
              {formData.firstName} {formData.lastName}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-bold uppercase tracking-widest text-ash text-xs">Race</dt>
            <dd className="text-ink">{raceLabel}</dd>
          </div>
          {isGroup && (
            <div className="flex justify-between">
              <dt className="font-bold uppercase tracking-widest text-ash text-xs">Athletes</dt>
              <dd className="text-ink">{participantCount}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="font-bold uppercase tracking-widest text-ash text-xs">Bandana</dt>
            <dd className="text-ink">{bandanaColor}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-bold uppercase tracking-widest text-ash text-xs">Donation</dt>
            <dd className="font-bold" style={{ color: '#F0307A' }}>
              {isComp ? 'Covered by a sponsor' : `$${donationAmount}`}
            </dd>
          </div>
        </dl>
      </div>

      <p className="mb-8 font-body text-sm text-ash">
        {isComp
          ? 'We have your registration. Bring photo ID to check-in on race morning.'
          : 'Check your email for a receipt from Stripe.'}
      </p>

      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}

// Main orchestrator
export function RegisterFlow({ comp }: { comp?: { code: string } }) {
  // A covered entry skips payment, so the flow is one step shorter.
  const isComp = !!comp;
  const stepLabels = isComp
    ? ['Race Selection', 'Athlete Info', 'Confirmation']
    : ['Race Selection', 'Athlete Info', 'Payment', 'Confirmation'];
  const confirmationStep = (isComp ? 3 : 4) as Step;

  const [step, setStep] = useState<Step>(1);
  const [raceType, setRaceType] = useState<RaceType>(null);
  const [bandanaColor, setBandanaColor] = useState('');
  // Which rung of the donation ladder is selected — 0 is the recommendation the
  // form opens on, null means they typed their own amount instead. Holding the
  // rung rather than the dollars is what lets the amount follow the race and
  // the headcount without any state to keep in sync.
  const [presetIndex, setPresetIndex] = useState<number | null>(0);
  const [customDonation, setCustomDonation] = useState(0);
  const [participantCount, setParticipantCount] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    emergencyName: '',
    emergencyPhone: '',
    guardianName: '',
    referredByName: '',
  });
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Nothing pre-fills the donation field; the amount is read off the ladder, so
  // it follows the race and the headcount until someone types over it. The 10K
  // ladder stands in before a race is picked, which is what makes the form open
  // on the recommended $99.
  const donationPresets =
    raceType === 'fun-run' ? DONATION_PRESETS_FUN_RUN : DONATION_PRESETS_10K;
  const donationAmount =
    presetIndex === null
      ? customDonation
      : donationPresets[presetIndex] * participantCount;

  const [loadingIntent, setLoadingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  // Remember which printed QR code brought them here, before anything in the
  // flow can change the URL. Writes to sessionStorage only — no state, so it
  // cannot re-render anything.
  useEffect(() => {
    captureSource();
  }, []);

  // Not memoized by hand — the React Compiler handles that, and a manual
  // useCallback here blocks it from optimizing the component at all.
  const handleStep2ToStep3 = async () => {
    if (!raceType) return;
    setLoadingIntent(true);
    setIntentError(null);
    try {
      if (comp) {
        const result = await submitCompRegistration({
          code: comp.code,
          raceType,
          bandanaColor,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          emergencyName: formData.emergencyName,
          emergencyPhone: formData.emergencyPhone,
          guardianName: formData.guardianName,
          waiverAgreed,
        });
        if ('error' in result) setIntentError(result.error);
        else setStep(confirmationStep);
        return;
      }

      const result = await createPaymentIntent({
        raceType,
        bandanaColor,
        amount: donationAmount * 100,
        participantCount,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone,
        guardianName: formData.guardianName,
        waiverAgreed,
        referredByName: formData.referredByName,
        qrSource: readSource(),
      });
      if ('error' in result) {
        setIntentError(result.error);
      } else {
        setClientSecret(result.clientSecret);
        setStep(3);
      }
    } catch (err) {
      setIntentError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoadingIntent(false);
    }
  };

  return (
    <div>
      {step !== confirmationStep && <StepIndicator step={step} labels={stepLabels} />}

      {step === 1 && (
        <StepRaceSelection
          setRaceType={setRaceType}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <>
          <StepAthleteInfo
            formData={formData}
            setFormData={setFormData}
            bandanaColor={bandanaColor}
            setBandanaColor={setBandanaColor}
            donationAmount={donationAmount}
            donationPresets={donationPresets}
            presetIndex={presetIndex}
            setPresetIndex={setPresetIndex}
            setCustomDonation={setCustomDonation}
            participantCount={participantCount}
            setParticipantCount={setParticipantCount}
            waiverAgreed={waiverAgreed}
            setWaiverAgreed={setWaiverAgreed}
            isComp={isComp}
            onNext={handleStep2ToStep3}
            onBack={() => setStep(1)}
            loading={loadingIntent}
          />
          {intentError && (
            <p className="mt-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700" role="alert">
              {intentError}
            </p>
          )}
        </>
      )}

      {!isComp && step === 3 && clientSecret && (
        <StepPayment
          clientSecret={clientSecret}
          raceType={raceType}
          formData={formData}
          donationAmount={donationAmount}
          participantCount={participantCount}
          bandanaColor={bandanaColor}
          onSuccess={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === confirmationStep && (
        <StepConfirmation
          raceType={raceType}
          formData={formData}
          donationAmount={donationAmount}
          participantCount={participantCount}
          bandanaColor={bandanaColor}
          isComp={isComp}
        />
      )}
    </div>
  );
}
