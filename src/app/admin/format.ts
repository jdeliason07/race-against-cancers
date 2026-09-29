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

/**
 * `(801) 555-0123` for a US/Canada number, which is nearly all of them.
 * Anything else stays in the E.164 form it was stored in — still dialable,
 * and reformatting a foreign number by guesswork would only make it wrong.
 */
export function phoneDisplay(e164: string): string {
  const us = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return us ? `(${us[1]}) ${us[2]}-${us[3]}` : e164;
}

/** `Sep 14`, or '' for a missing or unparseable timestamp. */
export function when(value: string | null): string {
  if (!value) return '';
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
