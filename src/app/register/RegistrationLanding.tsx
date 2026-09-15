'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  CHARITY_NAME,
  CHARITY_URL,
  EVENT_DATE_DISPLAY,
  EVENT_LOCATION_NAME,
  FINISH_LOCATION_NAME,
  FUN_RUN_LOCATION_NAME,
  FUN_RUN_START_TIME,
  ORG_EIN,
  ORG_NAME,
  QR_SOURCE_HEADLINES,
  RECOMMENDED_DONATION_AMOUNT,
  RECOMMENDED_DONATION_FUN_RUN,
  TEN_K_START_TIME,
} from '@/config/site';
import { captureSource } from '@/lib/qrSource';
import { RegisterFlow } from './RegisterFlow';
import { PreSignupForm } from './PreSignupForm';

type RaceType = '10k' | 'fun-run';

/**
 * The campaign code, read through useSyncExternalStore rather than an effect.
 *
 * sessionStorage is an external store React cannot see, and this is the hook
 * built for exactly that: the server snapshot is '' so the markup hydrates
 * identically, and React re-renders once with the real value straight after.
 * The snapshot has to be referentially stable or React re-renders forever,
 * hence the module-level cache — which also means the write into sessionStorage
 * happens exactly once per page load.
 */
let cachedSource: string | null = null;
function sourceSnapshot(): string {
  if (cachedSource === null) cachedSource = captureSource();
  return cachedSource;
}
const serverSourceSnapshot = () => '';
// The value is fixed for the life of the page, so there is nothing to subscribe
// to — but the hook requires a subscribe function, so this is the no-op one.
const subscribeToNothing = () => () => {};

const RACES: {
  key: RaceType;
  label: string;
  distance: string;
  route: string;
  amount: number;
}[] = [
  {
    key: '10k',
    label: '10K',
    distance: '6.2 miles',
    route: 'Provo Canyon down to Center Street',
    amount: RECOMMENDED_DONATION_AMOUNT,
  },
  {
    key: 'fun-run',
    label: 'Fun Run',
    distance: '~2 miles',
    route: 'LaVell Edwards Stadium to downtown — kids can finish it',
    amount: RECOMMENDED_DONATION_FUN_RUN,
  },
];

/**
 * The momentum bar, and the reason it is conditional.
 *
 * A thermometer reading "$0 raised · 0% of goal" is not social proof, it is an
 * argument against registering — the first person through the door does not
 * want to see that they are the first person through the door. So until the
 * total clears MOMENTUM_MIN_RAISED the goal is stated forward-looking instead,
 * and the bar appears on its own once there is something to show.
 */
function Momentum({ raised, goal }: { raised: number; goal: number }) {
  const pct = Math.min(Math.round((raised / goal) * 100), 100);
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="font-display text-2xl uppercase leading-none text-ink">
          ${raised.toLocaleString()} raised
        </span>
        <span className="font-body text-xs uppercase tracking-widest text-ash">
          of ${goal.toLocaleString()}
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-pill bg-petal"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% of the $${goal.toLocaleString()} goal raised`}
      >
        <div
          className="h-full rounded-pill bg-pink transition-all duration-700"
          style={{ width: `${pct === 0 ? 1 : pct}%` }}
        />
      </div>
    </div>
  );
}

export function RegistrationLanding({
  raised,
  goal,
  showMomentum,
}: {
  raised: number;
  goal: number;
  showMomentum: boolean;
}) {
  // Picking a race is what "step 1" means here: the landing page IS the first
  // step, so choosing one hands straight off to the form at step 2 rather than
  // making people re-answer the same question on the next screen.
  const [race, setRace] = useState<RaceType | null>(null);
  const [wantsReminder, setWantsReminder] = useState(false);

  // Read in the browser rather than from a server-rendered searchParam, on
  // purpose. Touching searchParams on the server would opt this page out of
  // static rendering, and the live donation total behind it costs a paginated
  // Stripe search — which every scanner would then wait on. A cached page for
  // everyone beats a server-rendered line of copy for one campaign, so this
  // line arrives a moment after hydration instead.
  const source = useSyncExternalStore(subscribeToNothing, sourceSnapshot, serverSourceSnapshot);
  const qrHeadline = QR_SOURCE_HEADLINES[source] ?? '';

  // Handing someone from the hero to the form leaves them scrolled wherever
  // they tapped, which reads as a broken page on a phone.
  useEffect(() => {
    if (race) window.scrollTo(0, 0);
  }, [race]);

  if (race) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <RegisterFlow initialRace={race} />
      </div>
    );
  }

  return (
    <div className="bg-paper">
      {/* ── ABOVE THE FOLD ──────────────────────────────────────────────
          Everything down to the race buttons is sized to land inside a
          390×844 phone without a scroll. The first action a scanner can take
          must be visible; anything below this block is for the people who
          want more before they decide. */}
      <section className="px-6 pb-10 pt-5">
        <div className="mx-auto max-w-2xl">
          {qrHeadline && (
            <p className="mb-2 font-body text-sm font-bold text-pink transition-opacity duration-500">
              {qrHeadline}
            </p>
          )}

          <p className="section-label">Nov 7, 2026 · Provo, Utah</p>

          <h1 className="mt-2 font-display text-[clamp(36px,10vw,64px)] uppercase leading-[0.9] tracking-[0.01em] text-ink">
            Miles mean <em className="not-italic text-pink">more here</em>
          </h1>

          <p className="mt-3 font-body text-base leading-relaxed text-ash">
            A 10K and a family Fun Run through Provo. Your registration{' '}
            <span className="font-semibold text-ink">is</span> the donation — it goes to{' '}
            <a
              href={CHARITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline decoration-petal underline-offset-2 hover:decoration-pink"
            >
              {CHARITY_NAME}
            </a>
            .
          </p>

          {showMomentum ? (
            <Momentum raised={raised} goal={goal} />
          ) : (
            <p className="mt-5 font-body text-sm text-ash">
              <span className="font-bold text-ink">Goal: ${goal.toLocaleString()}</span> for cancer
              care in Utah County. Every registration is part of it.
            </p>
          )}

          {/* The one decision on the page. */}
          <div className="mt-6">
            <h2 className="font-body text-xs font-bold uppercase tracking-widest text-ash">
              Pick your race to start
            </h2>
            <div className="mt-3 flex flex-col gap-3">
              {RACES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRace(r.key)}
                  className="group flex items-center justify-between gap-4 rounded-card border-2 border-line bg-paper px-5 py-4 text-left transition-colors duration-150 hover:border-pink hover:bg-blush focus-visible:border-pink"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-2xl uppercase leading-none text-ink">
                      {r.label}
                    </span>
                    <span className="mt-1 block font-body text-xs leading-snug text-ash">
                      {r.distance} · {r.route}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-display text-xl text-ink">${r.amount}</span>
                    <span
                      aria-hidden="true"
                      className="font-body text-lg text-petal transition-colors group-hover:text-pink"
                    >
                      &rsaquo;
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {/* The release valve. $99 is the anchor and it stays large, but a
                headline price with no stated flexibility turns away the people
                who would have given something. There is genuinely no minimum. */}
            <p className="mt-3 font-body text-sm text-ash">
              Recommended amounts — <span className="font-semibold text-ink">there is no minimum</span>.
              Give what you&rsquo;re willing.
            </p>
            <p className="mt-2 font-body text-xs uppercase tracking-widest text-ash">
              About 60 seconds · Apple&nbsp;Pay &amp; Google&nbsp;Pay
            </p>
          </div>

          {/* The catch for the ~97% of curious scanners who will not register
              standing in a hallway. Losing them entirely is the expensive
              outcome; a phone number is not. */}
          <div className="mt-6 border-t border-line pt-5">
            {wantsReminder ? (
              <PreSignupForm variant="remind" />
            ) : (
              <button
                type="button"
                onClick={() => setWantsReminder(true)}
                className="font-body text-sm font-semibold text-pink underline decoration-petal underline-offset-4 hover:decoration-pink"
              >
                Not right now? Send me the details instead &rarr;
              </button>
            )}
          </div>

          <p className="mt-6 font-body text-xs leading-relaxed text-ash">
            {ORG_NAME} is a registered 501(c)(3) nonprofit. EIN {ORG_EIN}. Payments are processed by
            Stripe — we never see your card number.
          </p>
        </div>
      </section>

      {/* ── BELOW THE FOLD ─────────────────────────────────────────────
          Three blocks, no more. Anyone who scrolled is asking a specific
          question; each block answers exactly one of them. */}
      <section className="border-t border-line bg-mist px-6 py-12">
        <div className="mx-auto grid max-w-2xl gap-8">
          <div>
            <h2 className="section-label mb-3">What you&rsquo;re signing up for</h2>
            <dl className="grid gap-3">
              {RACES.map((r) => (
                <div key={r.key} className="rounded-card border border-line bg-paper p-4">
                  <dt className="font-display text-lg uppercase text-ink">
                    {r.label} — {r.distance}
                  </dt>
                  <dd className="mt-1 font-body text-sm leading-relaxed text-ash">
                    {r.route}. Recommended donation ${r.amount} per athlete.
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="section-label mb-3">Where the money goes</h2>
            <p className="font-body text-sm leading-relaxed text-ash">
              Every registration is a donation to{' '}
              <span className="font-semibold text-ink">{CHARITY_NAME}</span>, granted on by{' '}
              {ORG_NAME}, a registered 501(c)(3) nonprofit — EIN {ORG_EIN}. The card processing fee
              is added on top of your gift rather than taken out of it, so the full amount you
              choose is the amount that arrives.
            </p>
          </div>

          <div>
            <h2 className="section-label mb-3">Race day</h2>
            <p className="font-body text-sm leading-relaxed text-ash">
              {EVENT_DATE_DISPLAY}. The 10K starts at {TEN_K_START_TIME} from{' '}
              {EVENT_LOCATION_NAME}; the Fun Run starts at {FUN_RUN_START_TIME} from{' '}
              {FUN_RUN_LOCATION_NAME}. Both finish at {FINISH_LOCATION_NAME}.
            </p>
            <Link
              href="/race-details"
              className="mt-3 inline-block font-body text-sm font-semibold text-pink underline decoration-petal underline-offset-4 hover:decoration-pink"
            >
              Full course, parking and check-in details &rarr;
            </Link>
          </div>

          {/* The page has one action, so the bottom of it repeats that action
              rather than offering a different one. */}
          <div className="rounded-card border-2 border-pink bg-blush p-6 text-center">
            <p className="font-display text-2xl uppercase leading-tight text-ink">
              Ready when you are
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {RACES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRace(r.key)}
                  className="btn-primary w-full flex-col gap-0 py-3 leading-tight"
                >
                  <span>Register for the {r.label}</span>
                  <span className="font-body text-xs font-semibold normal-case tracking-normal text-white/80">
                    ${r.amount} recommended · no minimum
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
