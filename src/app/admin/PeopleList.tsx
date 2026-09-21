'use client';
import { useState } from 'react';
import type { PersonRow } from '@/lib/adminStats';
import { cn } from '@/lib/utils';
import { exactMoney, when } from './format';

/** Rows shown before "Show all" — enough to see the last few at a glance. */
const COLLAPSED_ROWS = 4;

/**
 * The right-hand figure on a row: what this registration gave.
 *
 * A covered entry is named rather than printed as "$0" — it paid nothing by
 * design and reads as a mistake otherwise. A record with no donation recorded
 * at all (one written before the webhook stored the amount) shows nothing,
 * which is the honest answer.
 */
function amountLabel(row: PersonRow): string | null {
  if (row.covered) return 'Covered';
  if (row.amountCents === null || row.amountCents === undefined) return null;
  return exactMoney(row.amountCents);
}

/**
 * A list of people with a "Show all" that opens the rest.
 *
 * Expanding scrolls inside a fixed height instead of growing the page without
 * limit: this sits in a SwipeDeck pane whose height is measured, and a list of
 * several hundred registrations would otherwise bury the panels under it.
 */
export function PeopleList({ rows, empty }: { rows: PersonRow[]; empty: string }) {
  const [expanded, setExpanded] = useState(false);

  if (rows.length === 0) return <p className="font-body text-sm text-ash">{empty}</p>;

  const visible = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);

  return (
    <div className="rounded-card border border-line">
      <div
        className={cn(expanded && 'max-h-[60vh] overflow-y-auto overscroll-contain')}
      >
        <ul className="divide-y divide-line">
          {visible.map((row, i) => {
            const amount = amountLabel(row);
            return (
              // Email is the natural key, but a Stripe customer can have none —
              // and with the whole list on screen, two blanks would collide.
              <li
                key={row.email || `${row.name}-${i}`}
                className="flex items-baseline justify-between gap-4 px-4 py-3"
              >
                <span className="min-w-0 font-body text-sm text-ink">
                  <span className="font-bold">{row.name}</span>
                  <span className="ml-2 break-all text-ash">{row.email}</span>
                </span>
                <span className="shrink-0 font-body text-xs text-ash">
                  {amount && <span className="mr-2 font-bold text-ink">{amount}</span>}
                  {when(row.at)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {rows.length > COLLAPSED_ROWS && (
        // Outside the scroller, so it stays put once the list is open.
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="block w-full rounded-b-card border-t border-line px-4 py-3 font-body text-xs font-bold uppercase tracking-widest text-pink transition-colors duration-200 hover:bg-mist"
        >
          {expanded ? 'Show fewer' : `Show all ${rows.length.toLocaleString()}`}
        </button>
      )}
    </div>
  );
}
