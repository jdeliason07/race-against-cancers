// ============================================================
// SPONSORS — the one list every sponsor mention on the site reads from:
// the scrolling banner on the home page, "Presented by" in the hero, the logo
// row in "Where your donation goes", the race-day moments on /race-details,
// and the cards on /sponsors. Adding or changing a sponsor is one line here.
//
// Fields:
//   logo   — a file in public/images/sponsors/, ideally a transparent PNG at
//            least 640px wide.
//   url    — their website. Every logo links to it.
//   tier   — "presenting" sponsors appear in the hero and lead /sponsors;
//            "supporting" sponsors follow them.
//   quote  — a line from the owner for their /sponsors card. "" leaves the
//            card without one.
//   moment — the race-day moment they provide, as it should read, e.g.
//            "Water stations by Owala". "" means they have none.
//   photo  — a team photo for their /sponsors card, e.g.
//            "/images/sponsors/team/owala.jpg". "" hides the slot.
//
// Keep every sponsor mention an acknowledgment, to protect our 501(c)(3)
// status: name, logo, link, and neutral description only. No quality claims
// ("best", "favorite"), prices, discounts, promo codes, or "buy / shop / visit
// now". That includes owner quotes.
// ============================================================

export type SponsorTier = 'presenting' | 'supporting';

export type Sponsor = {
  name: string;
  logo: string;
  url: string;
  tier: SponsorTier;
  quote: string;
  moment: string;
  photo: string;
};

export const SPONSORS: Sponsor[] = [
  { name: "WealthWave",           logo: "/images/sponsors/wealthwave.png",          url: "https://wealthwave.com/",                             tier: "presenting", quote: "", moment: "",                                           photo: "" },
  { name: "Moxie Pest Control",   logo: "/images/sponsors/moxie-pest-control.png",  url: "https://moxieservices.com/locations/salt-lake-city/", tier: "presenting", quote: "", moment: "",                                           photo: "" },
  { name: "Owala",                logo: "/images/sponsors/owala.png",               url: "https://owalalife.com/",                              tier: "presenting", quote: "", moment: "Water stations by Owala",                    photo: "" },
  { name: "Fat Daddy's Pizzeria", logo: "/images/sponsors/fat-daddys-pizzeria.png", url: "https://fatdaddyspizzeria.com/",                      tier: "supporting", quote: "", moment: "Post-race pizza from Fat Daddy's Pizzeria",  photo: "" },
  { name: "Rockwell Ice Cream",   logo: "/images/sponsors/rockwell-ice-cream.png",  url: "https://rockwellicecream.com/",                       tier: "supporting", quote: "", moment: "Finish-line treats from Rockwell Ice Cream", photo: "" },
];

export const PRESENTING_SPONSORS = SPONSORS.filter((s) => s.tier === 'presenting');
export const SUPPORTING_SPONSORS = SPONSORS.filter((s) => s.tier === 'supporting');
export const SPONSOR_MOMENTS     = SPONSORS.filter((s) => s.moment !== '');

/** "https://www.owalalife.com/" → "owalalife.com", the neutral link text on cards. */
export function sponsorDomain(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}
