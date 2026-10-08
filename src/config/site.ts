// ============================================================
// RACE AGAINST CANCERS — SITE CONFIGURATION
// ============================================================
// This is the ONE file to edit for content updates.
// Non-developers: only touch this file and src/data/*.ts
// ============================================================

// --- CHARITY ------------------------------------------------
// The beneficiary. We don't publish Intermountain's own tax ID — the entity
// that receives registrations, and so the one a donor would cite, is us.
export const CHARITY_NAME = "Intermountain Cancer Center Utah Valley";
export const CHARITY_URL  = "https://intermountainhealthcare.org/locations/utah-valley-clinic/cancer-center-utah-valley";

// --- EVENT --------------------------------------------------
// The registered entity name, in full. There is no corporate suffix — the
// organization is registered as "Race Against Cancers", not "... Inc." — so
// this one constant serves both prose and the places that mean the legal
// person: schema.org organizer, the privacy policy, email from-names, and the
// copyright line.
export const ORG_NAME            = "Race Against Cancers";
// Our federal tax ID. Section 9.2 of the Participant Agreement has us
// receiving the registration as a donation and granting the proceeds on, so
// this is the number that belongs on any receipt or acknowledgment. Shown in
// the footer on every page, alongside our 501(c)(3) status.
//
// That status is a separate IRS determination from having an EIN, and the
// footer states both. The organizer has confirmed the determination; if it
// ever lapses, drop the 501(c)(3) wording in Footer.tsx before the number.
export const ORG_EIN             = "42-3071442";
export const EVENT_NAME          = "Race Against Cancers 2026";
export const EVENT_DATE_ISO      = "2026-11-07T08:00:00-07:00"; // first start (10K), 8:00 AM MST
export const EVENT_DATE_DISPLAY  = "Saturday, November 7, 2026";
// Staggered starts, one race at a time on the same loop.
export const TEN_K_START_TIME    = "8:00 AM";
export const FIVE_K_START_TIME   = "8:30 AM";
export const FUN_RUN_START_TIME  = "9:00 AM";
// Check-in opens 30 minutes before each race.
export const TEN_K_CHECK_IN_TIME   = "7:30 AM";
export const FIVE_K_CHECK_IN_TIME  = "8:00 AM";
export const FUN_RUN_CHECK_IN_TIME = "8:30 AM";
export const EVENT_YEAR          = "2026";

// --- LOCATION -----------------------------------------------
// Every race starts, runs, and finishes inside Creekside Park in Alpine, as
// loops of the park. (The earlier Provo road course — LaVell Edwards Stadium
// to the courthouse — is retired.)
export const EVENT_LOCATION_NAME     = "Creekside Park";
export const EVENT_CITY              = "Alpine, UT";
// Street address shown under the park name. Leave "" until confirmed and the
// pages show just "Creekside Park, Alpine, UT".
export const EVENT_STREET_ADDRESS    = "100 South & 600 East";
export const EVENT_ZIP               = "84004";
export const EVENT_LOCATION_ADDRESS  = EVENT_STREET_ADDRESS
  ? `${EVENT_STREET_ADDRESS}, ${EVENT_CITY} ${EVENT_ZIP}`
  : `${EVENT_LOCATION_NAME}, ${EVENT_CITY}`;
export const EVENT_MAPS_URL          =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${EVENT_LOCATION_NAME}, ${EVENT_CITY}`)}`;
// Set to "" until an official GPS recording of the loop exists.
export const COURSE_GPX_URL          = "";

// --- REGISTRATION GATE --------------------------------------
// Flip REGISTRATION_OPEN to true when registration goes live — every nav link,
// button, and page on the site switches over automatically.
// REGISTRATION_OPENS_DATE controls the copy on the waitlist page. Leave it ""
// while the date is undecided and the page reads "Registration opens soon";
// set it (e.g. 'October 1, 2026') to announce a date.
export const REGISTRATION_OPEN       = true;
// Annotated as `string` so setting or clearing the date stays a one-word edit
// — without it TypeScript narrows to this exact literal and the checks that
// ask "is a date set?" become type errors.
export const REGISTRATION_OPENS_DATE: string = 'September 15, 2026';
// Reads "opens soon" until a date is set, then the date itself.
export const REGISTRATION_OPENS_LABEL = REGISTRATION_OPENS_DATE || 'soon';

// --- REGISTRATION -------------------------------------------
// The race has no attendance cap — registration stays open regardless of
// how many people sign up.
// There is no donation minimum: any amount registers an athlete. These are the
// recommended amounts — the number quoted across the site and the value the
// donation field is pre-filled with. Registrants can give less, or more.
export const RECOMMENDED_DONATION_AMOUNT  = 99; // 10K, per athlete
export const RECOMMENDED_DONATION_5K      = 69; // 5K, per athlete
export const RECOMMENDED_DONATION_FUN_RUN = 49; // 1-Mile Walk, per athlete (key stays "fun-run")
// The one hard floor, and it is a payments constraint rather than a policy:
// Stripe rejects a charge under $0.50, so the form and the server both require
// at least this much.
export const MIN_DONATION_DOLLARS = 1;
// One-tap amounts under the donation field, per athlete and in the order shown.
// The first entry is the recommendation and the amount the field pre-fills
// with, so it has to stay the recommended constant above. Keep the ladders the
// same length — the chosen rung carries over when someone switches race.
export const DONATION_PRESETS_10K     = [RECOMMENDED_DONATION_AMOUNT, 199, 499];
export const DONATION_PRESETS_5K      = [RECOMMENDED_DONATION_5K, 149, 299];
export const DONATION_PRESETS_FUN_RUN = [RECOMMENDED_DONATION_FUN_RUN, 99, 199];
// One person can register and pay for a group (a company, a team, a family).
// The recommended donation is the per-athlete recommendation times this count.
export const MAX_PARTICIPANTS_PER_REGISTRATION = 100;
export const TEN_K_LABEL           = "10K (6.2 mi)";
export const FIVE_K_LABEL          = "5K (3.1 mi)";
export const FUN_RUN_LABEL         = "1-Mile Walk";

// --- RUNNER MILESTONE --------------------------------------
// The home page shows the next milestone, not progress toward the big goal:
// a near target reads as momentum, a far one reads as "nobody's coming".
// When registrations pass a milestone, the next one in the list shows. The
// live count itself is only shown once it reaches SHOW_RUNNER_COUNT_FROM.
export const RUNNER_MILESTONES    = [250, 500, 1000, 2000, 3052];
export const SHOW_RUNNER_COUNT_FROM = 100;
export const RUNNER_GOAL = RUNNER_MILESTONES[RUNNER_MILESTONES.length - 1];

// --- IMPACT -------------------------------------------------
// How the home page and About page describe where the money goes. Keep this
// true: "100%" holds only while sponsors, not registrations, pay for the race.
export const IMPACT_HEADLINE = "100% of every donation funds cancer treatment";
export const IMPACT_FAMILIES = 3;

// --- CARD PROCESSING FEE ------------------------------------
// Stripe keeps 2.9% + $0.30 of every card charge. Rather than letting that come
// out of the gift, it is added on top at checkout so the charity receives the
// full amount the athlete chose to give. The form shows the donation as chosen
// and discloses the total charge in a footnote under the payment fields.
// Set both numbers to 0 to go back to absorbing the fee ourselves — the
// footnote and the markup disappear on their own.
export const STRIPE_FEE_PERCENT     = 2.9;
export const STRIPE_FEE_FIXED_CENTS = 30;
// How the fee is described to registrants. Keep it in step with the numbers.
export const STRIPE_FEE_LABEL       = "2.9% + $0.30";

// --- REFERRAL INCENTIVE -------------------------------------
// Registrants name whoever referred them in a box on the form. Each named
// person earns the reward below — unlimited times. A report of who referred
// how many is emailed weekly by /api/referral-report.
// Set REFERRAL_REWARD to "" to switch the whole program off site-wide.
export const REFERRAL_REWARD: string = "$10 In-N-Out gift card";
export const REFERRAL_ENABLED = REFERRAL_REWARD !== "";
// The two of us refer people too, and we aren't buying ourselves gift cards.
// Anyone whose first name is listed here is left out of the referral tally
// entirely — the dashboard banner, the list under it, and the weekly email.
// Matched on the FIRST NAME only, case-insensitively, against whatever the
// registrant typed in the "Who referred you?" box, because they rarely type a
// surname. That bluntness cuts both ways: an unrelated Braden who refers a
// friend is silently dropped too. Empty the array to count everyone again.
export const REFERRAL_PAYOUT_EXEMPT_FIRST_NAMES: string[] = ["Jack", "Braden"];
// What one reward costs us, in cents. Only used to price the tally on the
// admin dashboard — keep it in step with the dollar figure inside
// REFERRAL_REWARD above, which is the string everyone actually reads.
export const REFERRAL_REWARD_VALUE_CENTS = 1000;
// The referred registration has to be worth having. A referral only earns a
// reward if the person who named their referrer donated at least this much —
// otherwise a $5 sign-up costs us a $10 card, and the incentive pays to lose
// money. Measured on the donation, not the total charge: the card fee the
// registrant covers on top never reaches us, so it can't count toward this.
// A group registration is judged on its one donation, not per athlete.
//
// Set at the full recommended 10K donation deliberately, and kept as its own
// number rather than pointed at RECOMMENDED_DONATION_AMOUNT so that changing
// what we ask for doesn't silently move what we pay out for. It is a bar, not
// a rule: the dashboard lists every near-miss with the exact gap, so a
// registration that came a dollar short is a card you can still choose to
// send. Set to 0 to reward every referral regardless of amount.
export const REFERRAL_MIN_DONATION_DOLLARS = 99;
// Optional logo on the referral callout at checkout and in the homepage
// announcement. Empty, and both render without one.
//
// Only ever put artwork here that we have permission to use. A brand's logo is
// their property, and reproducing it because we happen to buy their gift cards
// is not permission — naming the reward in text is fine, showing the mark is
// not. That is why this is blank: it held a fast-food chain's logo we had no
// licence for.
//
// WIDTH/HEIGHT are the pixel size of the file itself, which Next.js needs to
// reserve the right space. Swapping in a differently shaped logo only needs
// these two numbers updated — it's drawn with object-contain, so a stale ratio
// letterboxes rather than stretching the artwork.
export const REFERRAL_REWARD_LOGO: string = "";
export const REFERRAL_REWARD_LOGO_ALT = "";
export const REFERRAL_REWARD_LOGO_WIDTH = 512;
export const REFERRAL_REWARD_LOGO_HEIGHT = 512;

// --- SPONSORS ----------------------------------------------
// The scrolling logo banner under the Intermountain strip on the home page.
// Drop each logo in public/images/sponsors/ and point `logo` at it. A sponsor
// without a logo shows its name instead. `url` is optional. Empty list = the
// banner is hidden.
export const SPONSORS: { name: string; logo: string; url: string }[] = [
  { name: "Fat Daddy's Pizzeria", logo: "/images/sponsors/fat-daddys-pizzeria.png", url: "https://fatdaddyspizzeria.com/" },
  { name: "Rockwell Ice Cream",   logo: "/images/sponsors/rockwell-ice-cream.png",  url: "https://rockwellicecream.com/" },
  { name: "Moxie Pest Control",   logo: "/images/sponsors/moxie-pest-control.png",  url: "https://moxieservices.com/locations/salt-lake-city/" },
  { name: "WealthWave",           logo: "/images/sponsors/wealthwave.png",          url: "https://wealthwave.com/" },
];

// --- TEAM -------------------------------------------------
// Shown in "Who we are" on the About page. Add a photo by dropping the file in
// public/images/team/ and setting photo to its path, e.g. "/images/team/braden.jpg".
// Until then each person shows their initials.
export const TEAM: { name: string; photo: string }[] = [
  { name: "Braden Crystal",      photo: "" },
  { name: "Jack Eliason",        photo: "" },
  { name: "Mandi White",         photo: "" },
  { name: "Morgan Christensen",  photo: "" },
  { name: "Flora Ferguson",      photo: "" },
];

// --- CHECK-IN -----------------------------------------------
// Per-race times are with the start times above.
export const CHECK_IN_DATE     = "Saturday, November 7, 2026";
export const CHECK_IN_NOTE     = "Check in 30 minutes before your race";
export const CHECK_IN_LOCATION = "Creekside Park, Alpine — all races";

// --- CONTACT ------------------------------------------------
export const CONTACT_EMAIL = "events@raceagainstcancers.org";
export const CONTACT_PHONE = "858-774-2699";
export const VOLUNTEER_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScX-3U-iBEHY7YoIp1Htsdfz-NnOafxxGssKFWVrKnv7hDumQ/viewform";

// --- SOCIAL LINKS -------------------------------------------
// Set to "" to hide that icon in the footer
export const SOCIAL_INSTAGRAM = "https://www.instagram.com/raceagainstcancers";
export const SOCIAL_FACEBOOK  = "[[https://facebook.com/YOURPAGE]]";
export const SOCIAL_TWITTER   = "[[https://twitter.com/YOURHANDLE]]";
export const SOCIAL_YOUTUBE   = "[[https://youtube.com/@YOURCHANNEL]]";

// --- SEO ----------------------------------------------------
// Used by sitemap, robots.txt, metadataBase, and JSON-LD schema.
export const SITE_URL         = "https://raceagainstcancers.org";
export const META_DESCRIPTION =
  `Run for a reason. ${EVENT_NAME} — a 10K, 5K & 1-Mile Walk at Creekside Park in Alpine, Utah on ${EVENT_DATE_DISPLAY}, benefiting ${CHARITY_NAME}. Tax-deductible. Recommended donations: 10K $${RECOMMENDED_DONATION_AMOUNT}, 5K $${RECOMMENDED_DONATION_5K}, 1-Mile Walk $${RECOMMENDED_DONATION_FUN_RUN}.`;
