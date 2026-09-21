// Number and date formatting for the dashboard. Pure functions with no Stripe
// or server imports, because the panels render on the server and PeopleList
// renders on the client — both need the same shapes.

/** `$1,204`. Whole dollars: right for a fundraising total at a glance. */
export function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

/**
 * Dollars with the cents kept when there are any. money() above rounds, which
 * is right for a fundraising total and wrong for a donation being measured
 * against the referral minimum: it would print $94.99 as "$95" and make a
 * registration that missed the bar look like one that cleared it. Same reason
 * it is used for a single registration's donation in the people lists — that
 * number should match the registrant's card statement, not approximate it.
 */
export function exactMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** `Sep 14`, or '' for a missing or unparseable timestamp. */
export function when(value: string | null): string {
  if (!value) return '';
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
