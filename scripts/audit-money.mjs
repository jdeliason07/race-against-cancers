// Read-only. Answers "why doesn't /admin's Raised match what I know came in?"
//
//   STRIPE_SECRET_KEY=sk_live_... node scripts/audit-money.mjs
//
// The dashboard counts one narrow thing: succeeded PaymentIntents tagged with
// this event, donation portion only. This walks every charge in the account
// instead — charges, not PaymentIntents, because an invoice or a Payment Link
// produces one too and that is exactly the money the dashboard cannot see.
import { readFileSync } from 'node:fs';
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('STRIPE_SECRET_KEY is not set. Run:\n');
  console.error('  STRIPE_SECRET_KEY=sk_live_... node scripts/audit-money.mjs\n');
  process.exit(1);
}

// Read the tag out of the config rather than repeating it, so this can never
// disagree with what the app writes.
const config = readFileSync(new URL('../src/config/site.ts', import.meta.url), 'utf8');
const EVENT = config.match(/EVENT_NAME\s*=\s*"([^"]+)"/)?.[1];
if (!EVENT) throw new Error('Could not read EVENT_NAME from src/config/site.ts');

const usd = (cents) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const day = (unix) => new Date(unix * 1000).toISOString().slice(0, 10);

/** What the dashboard would count for one intent (see donationCentsOf). */
function donationCentsOf(intent) {
  const charged = intent.amount_received || intent.amount;
  const recorded = Number.parseInt(intent.metadata?.donationCents ?? '', 10);
  return Number.isInteger(recorded) && recorded > 0 && recorded <= charged ? recorded : charged;
}

const stripe = new Stripe(key);
const mode = key.startsWith('sk_live_') ? 'LIVE' : key.startsWith('sk_test_') ? 'TEST' : 'UNKNOWN';

const bucket = () => ({ count: 0, gross: 0, refunded: 0 });
const tagged = bucket();
const untagged = bucket();
const otherEvent = bucket();
let dashboardCents = 0;
let earliest = Infinity;
let latest = 0;
const samples = [];

for await (const charge of stripe.charges.list({ limit: 100, expand: ['data.payment_intent'] })) {
  if (charge.status !== 'succeeded') continue;

  const intent = typeof charge.payment_intent === 'object' ? charge.payment_intent : null;
  const tag = intent?.metadata?.event ?? charge.metadata?.event ?? null;
  const where = tag === EVENT ? tagged : tag ? otherEvent : untagged;

  where.count++;
  where.gross += charge.amount;
  where.refunded += charge.amount_refunded;

  if (tag === EVENT && intent) dashboardCents += donationCentsOf(intent);
  if (tag !== EVENT && samples.length < 25) {
    samples.push(
      `    ${day(charge.created)}  ${usd(charge.amount).padStart(11)}  ` +
        `${tag ? `tag:${tag}` : 'no event tag'}  ${charge.description ?? '(no description)'}`,
    );
  }

  earliest = Math.min(earliest, charge.created);
  latest = Math.max(latest, charge.created);
}

const all = [tagged, untagged, otherEvent];
const grossAll = all.reduce((sum, b) => sum + b.gross, 0);
const refundedAll = all.reduce((sum, b) => sum + b.refunded, 0);
const countAll = all.reduce((sum, b) => sum + b.count, 0);

console.log(`\nStripe mode:            ${mode}`);
console.log(`Event tag looked for:   "${EVENT}"`);
if (countAll === 0) {
  console.log('\nNo succeeded charges in this account at all.');
  console.log(mode === 'TEST' ? 'This is a TEST key — real donations live in live mode.\n' : '\n');
  process.exit(0);
}
console.log(`Charges (succeeded):    ${countAll}, ${day(earliest)} … ${day(latest)}`);
console.log(`\nGross charged:          ${usd(grossAll)}`);
console.log(`  tagged this event:    ${usd(tagged.gross)}  (${tagged.count} charges)`);
console.log(`  no event tag:         ${usd(untagged.gross)}  (${untagged.count} charges)  <- invisible to /admin`);
console.log(`  tagged another event: ${usd(otherEvent.gross)}  (${otherEvent.count} charges)`);
console.log(`Refunded (all buckets): ${usd(refundedAll)}`);
console.log(`\n/admin "Raised" shows:  ${usd(dashboardCents)}`);
console.log('  (donations only — the card fee registrants covered is stripped out,');
console.log('   and refunds are NOT subtracted)');

if (samples.length > 0) {
  console.log('\nCharges the dashboard does not count:');
  console.log(samples.join('\n'));
  if (untagged.count + otherEvent.count > samples.length) {
    console.log(`    … and ${untagged.count + otherEvent.count - samples.length} more`);
  }
}
console.log('');
