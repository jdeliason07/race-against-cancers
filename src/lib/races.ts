// The races on offer, in one place. Pure data with no server imports, because
// the register form (client) and the server actions and dashboard all need the
// same list.
import {
  DONATION_PRESETS_10K,
  DONATION_PRESETS_5K,
  DONATION_PRESETS_FUN_RUN,
  FIVE_K_LABEL,
  FUN_RUN_LABEL,
  TEN_K_LABEL,
} from '@/config/site';

/**
 * Every race, longest first — the order the form offers them in.
 *
 * The key is what registration writes to Stripe as `raceType`, so once anyone
 * has registered under one it is permanent: relabel a race freely, but never
 * rename its key, or the dashboard stops counting everyone already entered.
 */
export const RACE_KEYS = ['10k', '5k', 'fun-run'] as const;

export type RaceKey = (typeof RACE_KEYS)[number];

export interface Race {
  /** With the distance, e.g. "10K (6.2 mi)" — for summaries and receipts. */
  label: string;
  /** Just the name, e.g. "10K" — for buttons and tight spaces. */
  short: string;
  /** One-tap donation amounts per athlete; the first is the recommendation. */
  presets: number[];
}

export const RACES: Record<RaceKey, Race> = {
  '10k':     { label: TEN_K_LABEL,   short: '10K',     presets: DONATION_PRESETS_10K },
  '5k':      { label: FIVE_K_LABEL,  short: '5K',      presets: DONATION_PRESETS_5K },
  'fun-run': { label: FUN_RUN_LABEL, short: '1-Mile Walk', presets: DONATION_PRESETS_FUN_RUN },
};

/** Both server actions are reachable by direct POST, so check before storing. */
export function isRaceKey(value: unknown): value is RaceKey {
  return (RACE_KEYS as readonly unknown[]).includes(value);
}
