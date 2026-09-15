# Race Against Cancer 2026 — Website

## Quick start
```bash
npm install
npm run dev
```

Deploy to Vercel: connect the repo and click Deploy.

### Environment variables (required)
Registration and the waitlist run on Stripe, so these must be set in Vercel — see `src/env.example`:

| Variable | What it is |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key. Without it the waitlist and checkout both fail closed. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key, used by the payment form in the browser. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for `/api/stripe/webhook`. Without it, successful payments are never recorded server-side. |

#### Test mode vs live mode — read before switching
Stripe keeps two completely separate sets of data. A `sk_test_` key writes to test mode; a
`sk_live_` key writes to live mode. **Records do not cross between them.**

That matters most for the waitlist. If signups were collected on test keys and you later swap in
live keys, those people vanish from the live Dashboard — they still exist in test mode, but the
site is now pointed elsewhere. Before switching, export the waitlist to CSV from the mode it was
collected in, or you'll lose the list you spent months building.

To check which mode you're in: look at whether `STRIPE_SECRET_KEY` in Vercel starts with
`sk_test_` or `sk_live_`, or flip the **Test mode** toggle in the Stripe Dashboard and see which
view your customers appear in.

Each mode also has its own webhook endpoint and its own signing secret, so adding a live-mode
endpoint (and updating `STRIPE_WEBHOOK_SECRET`) is a required part of going live.

---

## Opening registration

1. Add live Stripe keys in Vercel (above).
2. Add the webhook endpoint in the Stripe Dashboard → Developers → Webhooks:
   URL `https://<your-domain>/api/stripe/webhook`, event `payment_intent.succeeded`.
   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Register the site for Apple Pay — Stripe Dashboard → Settings → Payments → **Payment method
   domains** → add `raceagainstcancers.org` (and any preview domain you want wallets to work on).
   See "Apple Pay and Google Pay" below.
4. Flip `REGISTRATION_OPEN` to `true` in `src/config/site.ts`. Every nav link, button, and page
   switches from "Join the Waitlist" to "Register" automatically.
5. Email the waitlist from `/admin` — see "Emailing the waitlist" below.

### Who pays the card fee
Stripe keeps 2.9% + $0.30 of every card charge. Rather than that coming out of the gift, it is
added on top at checkout: a $99 donation is charged as $102.27, Stripe keeps $3.27, and $99
arrives. The donation stays $99 everywhere in the form — there is no subtotal line — and the fee
is disclosed as an asterisk under the payment fields on step 3: "Plus 2.9% + $0.30 Credit Card
Fee".
The charged total itself is not printed on the page; card payers see it on their receipt, and the
Apple Pay, Google Pay and Link sheets show it before they confirm.

The arithmetic lives in `src/lib/fees.ts`. Note that it is a division, not a 2.9% markup: the fee
is a cut of the *charge*, so marking the donation up by 2.9% would still leave Stripe taking 2.9%
of the markup and the gift short by a few cents. `STRIPE_FEE_PERCENT` and `STRIPE_FEE_FIXED_CENTS`
in `src/config/site.ts` hold the rate — set both to `0` to go back to absorbing the fee, and the
markup and the footnote both disappear.

The charge total is computed on the server when the PaymentIntent is created, so it applies to
wallets as well as cards and cannot be edited out of the request. Each intent carries
`donationCents` and `feeCents` in its metadata, and every total we report — the home page
thermometer, the `/admin` money panel, `donationAmount` on the customer record — counts the
donation rather than the gross, so the fee never inflates what looks like money raised.

### Apple Pay and Google Pay
Both appear as buttons above the card fields, drawn by Stripe's Express Checkout Element. Apple Pay
has two requirements beyond the Stripe keys, and until **both** are met the button simply doesn't
render — there is no error to see:

1. **The domain association file must be reachable.** It is committed at
   `public/.well-known/apple-developer-merchantid-domain-association` and served as plain text with
   no redirect (the header rule in `next.config.ts`). Apple fetches it over HTTPS.
2. **Each domain must be registered once with Stripe**, under Settings → Payments → Payment method
   domains. Do this for production and for any preview domain you plan to test on.

Then test on real hardware: Apple Pay only exists in Safari, and in Chrome or Edge on macOS. It
never shows on `http://localhost` (Apple requires HTTPS), and it never shows in Chrome on Windows
or Android — that is expected, not a bug. Google Pay is the one that shows up there instead.

### How a registration is recorded
Checkout creates a Stripe **Customer** (reusing the waitlist one if that email already joined) and a
**PaymentIntent** carrying the athlete's details and waiver acceptance. When payment succeeds, Stripe
calls the webhook, which copies those details onto the customer and flags it `registered = true`.
That flag — not the browser — is what makes a registration official.

### Group registrations
One person can register and pay for several athletes: the form asks how many, and the recommended
donation becomes the per-athlete recommendation × that count. There is no donation minimum — the
recommended amount only pre-fills the field, and the server accepts any amount of
`MIN_DONATION_DOLLARS` or more (that floor exists because Stripe will not charge less).
`MAX_PARTICIPANTS_PER_REGISTRATION` in `src/config/site.ts` caps it; above that the form points
people at `CONTACT_EMAIL`.

When the count is more than 1, the person is treated as an **organizer** rather than an athlete:
date of birth, emergency contact, and the under-18 guardian field are not collected, because they
describe an individual athlete and we don't have those people yet. The waiver checkbox changes to
an undertaking that every athlete (or their guardian) will accept it before race day.

**This means a group registration arrives with a headcount and no roster.** The count lands on the
Stripe customer record as `participantCount` — that's how many bibs are owed — but you still need
each athlete's name and signed waiver at check-in. Worth deciding how you'll run that table before
a 40-person group shows up on race morning.

### Sponsor-covered registrations (invite links)
When someone donates to cover entries for other people, send those people a private link instead
of collecting a headcount:

```
https://<your-domain>/register/invite/<COMP_REGISTRATION_CODE>
```

Each person walks the normal form — race, name, contact, date of birth, emergency contact,
guardian if under 18, bandana, waiver — and finishes without a payment step. **This is the better
way to handle a covered block**, because it arrives as real athletes with signed waivers rather
than a number you have to chase at check-in.

Two environment variables control it (see `src/env.example`):

| Variable | What it does |
|---|---|
| `COMP_REGISTRATION_CODE` | The secret in the link. Blank disables covered registration entirely. |
| `COMP_REGISTRATION_LIMIT` | How many free entries the link may create. Must be > 0 or the link is dead. |

The code is an environment variable rather than a `site.ts` constant on purpose: `site.ts` is
imported by Client Components, so anything in it ships to every visitor's browser.

Usage is counted by scanning customers stamped with `compCode`, so the limit is enforced without a
database and re-running never miscounts. Two caveats worth knowing:

- **Anyone with the link can claim an entry** — there's no per-person invite. Treat it like a
  password, and set the limit to exactly what was paid for.
- Stripe's search index lags writes by up to a minute, so two people claiming the last entry in the
  same minute could both succeed. Over-issuing by one or two is possible; the limit is a ceiling,
  not a lock. If Stripe can't be reached at all the link refuses rather than handing out entries.

Covered registrations record `donationAmount: 0` and never earn referral rewards, so a free entry
can't be used to farm gift cards. The link also works while `REGISTRATION_OPEN` is `false`, so a
sponsor's group can register before public registration opens.

### Organizer dashboard (`/admin`)
Password-protected, two tabs.

**Overview** pulls everything into one page:

| From Stripe | From Sender |
|---|---|
| Waitlist total and new this week | Campaigns sent, with delivered counts |
| Registrations, athletes, 10K vs Fun Run split | Opens and clicks, with rates |
| Covered entries claimed via invite link | Bounces |
| Total raised, raised this week, average gift | |
| Newest signups and registrations | |
| Referral leaderboard | |

Each panel loads independently and fails independently — a Stripe outage costs the Stripe panel,
not the page. Numbers are computed per request; nothing is cached or stored.

**Email** is the composer, described below.

### Emailing the waitlist (`/admin/email`)
Write and send to the waitlist without leaving the site. Email goes through **Sender**
(sender.net).

1. **Pick the audience** — choose a Sender group. The page lists them from your account.
2. **Sync** — copies waitlist signups out of Stripe and into that group. Safe to re-run; Sender
   updates existing subscribers rather than duplicating them. Do this before the first send.
3. **Write** — subject, optional preview text, and a plain-text body. Blank lines become
   paragraphs; no HTML to hand-write.
4. **Test** — sends a copy to one address, subject prefixed `[TEST]`.
5. **Send** — requires typing `SEND` to confirm, and shows the recipient count first. No undo.

Sender is the list of record for *sending*, because it owns unsubscribes and bulk email has to
honour them. Stripe stays the list of record for who signed up.

| Variable | What it does |
|---|---|
| `ADMIN_PASSWORD` | Password for the page. Minimum 12 characters, or the page stays disabled. |
| `SENDER_API_TOKEN` | Sender → Settings → API access tokens. Blank disables the page and the weekly report. |
| `SENDER_FROM_EMAIL` | Verified sending address on your Sender account. Falls back to `CONTACT_EMAIL`. |

Signing in sets an HMAC-signed, httpOnly cookie for 12 hours. Every server action re-checks it —
the page-level check alone wouldn't protect them, since actions are reachable by direct POST. The
route is `noindex` and disallowed in `robots.txt`.

This is one shared password for one organizer. If more than a couple of people need access,
replace it with real accounts rather than passing the password around.

### Referral rewards
Registrants type their referrer's full name into a "Who referred you?" box. The name is written
to the referred person's Stripe customer record (`referredByName`) **by the webhook**, so a
referral only counts once their payment succeeds.

`/api/referral-report` emails a tally every Monday (the cron lives in `vercel.json`): each
referrer, how many they brought that week, their all-time total, and who they referred. Counts are
derived from the records each run rather than kept as a running tally, so a repeated webhook
delivery can't inflate anyone's total. Names typed by registrants aren't verified — the report
lists who each person referred so you can skim before sending gift cards.

Needs `CRON_SECRET`, `SENDER_API_TOKEN`, `REPORT_EMAIL_TO`, and `SENDER_FROM_EMAIL` (see
`src/env.example`). It sends through the same Sender account as the admin page, using Sender's
transactional endpoint rather than a campaign. To run it on demand:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-domain>/api/referral-report
```

Set `REFERRAL_REWARD` to `""` in `src/config/site.ts` to switch the program off everywhere — the
form field, the FAQ entry, the waitlist copy, and the weekly email all stop.

The race has **no attendance cap** — there is no spots-remaining counter and nothing turns
registration off once a number is hit.

---

## Editing content

Content lives in two places:
- **`src/config/site.ts`** — event facts, links, contacts, social handles. The one file to edit
  for most changes; everything on the site reads from it.
- **`src/data/faq.ts`** — FAQ questions and answers.

### Still unfilled
Placeholders are written as `[[...]]`. Run `grep -rn '\[\[' src/` to list them; as of now:

| Constant | What to fill in | If left as-is |
|---|---|---|
| `CHARITY_EIN` | EIN / 501(c)(3) number | Not currently shown anywhere on the site |
| `SOCIAL_INSTAGRAM` | Full profile URL | That icon is hidden in the footer |
| `SOCIAL_FACEBOOK` | Full page URL | That icon is hidden in the footer |
| `SOCIAL_TWITTER` | Full profile URL | That icon is hidden in the footer |
| `SOCIAL_YOUTUBE` | Full channel URL | That icon is hidden in the footer |

`COURSE_GPX_URL` is intentionally empty — the race-details page shows "GPX Coming Soon" until an
official GPS recording of the 10K course exists.

### Branding assets
- **Favicon:** `src/app/icon.svg`.
- **Social share image:** generated at build time by `src/app/opengraph-image.tsx` — it's code, not
  a JPG, so edit that file rather than dropping in an image.
- `public/images/` holds the Intermountain Health logo; `public/fonts/` holds the display typeface.

---

## Architecture notes
- Payments run through Stripe in-house: server actions in `src/app/register/` create the
  PaymentIntent, `src/app/api/stripe/webhook/` records the result. See "Opening registration" above.
- Otherwise static + server components, deployable to Vercel.
- The donation total on the home page (`src/lib/getDonationTotal.ts`) reads live from Stripe and
  is cached by the `revalidate` export on that page.
- All external CTAs read from `site.ts` — change a URL once, it updates everywhere.
