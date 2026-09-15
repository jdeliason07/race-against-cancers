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
export const ORG_NAME            = "Race Against Cancers Inc.";
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
export const EVENT_DATE_ISO      = "2026-11-07T08:00:00-07:00"; // 5 Miler & Fun Run start 8:00 AM MST
export const EVENT_DATE_DISPLAY  = "Saturday, November 7, 2026";
export const FIVE_MILE_START_TIME = "8:00 AM";
export const FUN_RUN_START_TIME  = "8:00 AM";
export const EVENT_YEAR          = "2026";

// --- LOCATION -----------------------------------------------
// Both races start at LaVell Edwards Stadium and finish at the courthouse.
// 5 Miler, 5.1 mi: north on University Ave to the turnaround just past 3700 N,
// back down, then on to the finish. Fun Run, ~2 mi: the last leg of that, the
// stadium straight down to the same finish.
export const EVENT_LOCATION_NAME     = "LaVell Edwards Stadium";   // shared start
export const EVENT_LOCATION_ADDRESS  = "LaVell Edwards Stadium, Provo, UT 84602";
export const FINISH_LOCATION_NAME    = "Utah County Courthouse";   // shared finish
export const FINISH_LOCATION_ADDRESS = "University Ave & Center St, Provo, UT 84601";
// The Fun Run shares the 5 Miler's start. Kept as its own pair of constants because
// the two have been separate venues before and may be again — point them back
// at the shared start rather than retyping the address.
export const FUN_RUN_LOCATION_NAME    = EVENT_LOCATION_NAME;
export const FUN_RUN_LOCATION_ADDRESS = EVENT_LOCATION_ADDRESS;
// Set to "" until an official GPS recording of the 5 Miler course exists —
// the race-details page automatically shows "GPX Coming Soon" when empty.
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
export const RECOMMENDED_DONATION_AMOUNT  = 99; // 5 Miler, per athlete
export const RECOMMENDED_DONATION_FUN_RUN = 49; // Fun Run, per athlete
// The one hard floor, and it is a payments constraint rather than a policy:
// Stripe rejects a charge under $0.50, so the form and the server both require
// at least this much.
export const MIN_DONATION_DOLLARS = 1;
// One-tap amounts under the donation field, per athlete and in the order shown.
// The first entry is the recommendation and the amount the field pre-fills
// with, so it has to stay the recommended constant above. Keep the two ladders
// the same length — the chosen rung carries over when someone switches race.
export const DONATION_PRESETS_FIVE_MILE = [RECOMMENDED_DONATION_AMOUNT, 199, 499];
export const DONATION_PRESETS_FUN_RUN = [RECOMMENDED_DONATION_FUN_RUN, 99, 199];
// One person can register and pay for a group (a company, a team, a family).
// The recommended donation is the per-athlete recommendation times this count.
export const MAX_PARTICIPANTS_PER_REGISTRATION = 100;
// The long race measures 5.08 mi along the course polyline: out to the
// turnaround just past University Ave & 3700 N and back, then on to the finish.
// It was a 6.2 mi 10K until the turnaround moved to 3700 N. Change this one
// constant and the label follows everywhere it is shown.
export const FIVE_MILE_LABEL       = "5 Miler (5.1 mi)";
export const FUN_RUN_LABEL         = "Fun Run (~2 mi)";

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

// --- CHECK-IN -----------------------------------------------
export const CHECK_IN_DATE     = "Saturday, November 7, 2026";
export const CHECK_IN_TIME     = "7:00 AM (1 hour before race start)";
export const CHECK_IN_LOCATION = "LaVell Edwards Stadium, Provo — both races";

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
  `Run for a reason. ${EVENT_NAME} — a 5 Miler & Fun Run on ${EVENT_DATE_DISPLAY}, benefiting ${CHARITY_NAME}. 5 Miler recommended donation $${RECOMMENDED_DONATION_AMOUNT}, family-friendly Fun Run $${RECOMMENDED_DONATION_FUN_RUN}.`;
