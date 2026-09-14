import {
  CONTACT_EMAIL,
  MAX_PARTICIPANTS_PER_REGISTRATION,
  MIN_DONATION_AMOUNT,
  MIN_DONATION_FUN_RUN,
  REFERRAL_ENABLED,
  REFERRAL_REWARD,
  REGISTRATION_OPEN,
  REGISTRATION_OPENS_LABEL,
} from '@/config/site';

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    question: "When does registration open?",
    answer: REGISTRATION_OPEN
      ? "Registration is open now — head to the registration page to claim your spot."
      : `Registration opens ${REGISTRATION_OPENS_LABEL}. Join the waitlist with your name, email, and phone number and we'll email and text you the moment it goes live.`,
  },
  ...(REFERRAL_ENABLED
    ? [{
        question: "How does the referral reward work?",
        answer: `Tell your friends to put your full name in the "Who referred you?" box when they register. Every friend who registers and names you earns you a ${REFERRAL_REWARD}. There's no cap — refer ten friends, get ten gift cards. Referrals count once your friend's registration is paid, and we will reach out to you for delivery of your gift card.`,
      }]
    : []),
  {
    question: "What is the registration fee?",
    answer: "There is no flat entry fee. Registration requires a minimum $99 donation to Intermountain Cancer Center Utah Valley for the 10K, or a minimum $49 donation for the family-friendly Fun Run. The minimum is per athlete, so a family of four doing the Fun Run gives at least $196 — and you can register all four in one go rather than filling in the form four times. We warmly encourage you to give as much more as you're willing.",
  },
  {
    question: "Can I register a group, or pay for other people?",
    answer: `Yes. On the registration form, enter how many athletes you're registering and the donation minimum adjusts automatically — $${MIN_DONATION_AMOUNT} per athlete for the 10K, $${MIN_DONATION_FUN_RUN} per athlete for the Fun Run. This works for a family, a team, a company, or anyone who wants to cover entries for others. You give us your contact details once; each athlete's name and waiver are collected at check-in on race morning. For groups larger than ${MAX_PARTICIPANTS_PER_REGISTRATION}, email ${CONTACT_EMAIL} and we'll sort it out with you.`,
  },
  {
    question: "Can I register without fundraising?",
    answer: "Yes. There is no peer-to-peer fundraising requirement. Your donation at registration is all that's needed. You won't be asked to recruit other donors or hit a fundraising goal.",
  },
  {
    question: "What's the difference between the 10K and the Fun Run?",
    answer: "Both races start at LaVell Edwards Stadium on the BYU campus and finish in front of the Utah County Courthouse at University Avenue and Center Street in downtown Provo. The 10K is 6.2 miles and runs as an out-and-back: north up University Avenue toward the mouth of Provo Canyon, a turnaround just past the Provo River at mile 2.4, then a straight 3.8-mile descent south into downtown. The minimum donation is $99. The Fun Run is approximately 2 miles — it skips the northbound half and heads straight down University Avenue to the same finish line, with a $49 minimum donation. It's the one most families choose — short enough for kids to finish, easy to walk the whole way, and strollers are welcome. Both events take place on November 7, 2026.",
  },
  {
    question: "How do I get to the start line?",
    answer: "Both the 10K and the Fun Run start at LaVell Edwards Stadium on the BYU campus in Provo (1700 N Canyon Rd). Participants are responsible for their own transportation to the stadium. Check-in is at the stadium — plan to arrive by 7:00 AM. Both races start promptly at 8:00 AM.",
  },
  {
    question: "Where is the finish line, and how do I get back to my car?",
    answer: "Both races finish in front of the Utah County Courthouse at University Avenue and Center Street in downtown Provo, about two miles south of the start. Because the courses are point-to-point, plan for how you'll get back to the stadium — walking, a ride, or public transit along University Avenue.",
  },
  {
    question: "What's included with registration?",
    answer: "Every registered participant receives a race bib and a complimentary bandana. Additional details confirmed closer to race day.",
  },
  {
    question: "What is the refund policy?",
    answer: "Donations are non-refundable. Registration transfers are available until October 1, 2026 — reach out to us directly to arrange a transfer.",
  },
  {
    question: "When and where is check-in?",
    answer: "Check-in is on race morning — Saturday, November 7, 2026, at 7:00 AM at LaVell Edwards Stadium (1700 N Canyon Rd, Provo). The 10K and the Fun Run share the same check-in. Your bib and bandana will be available there.",
  },
  {
    question: "Where does my donation go?",
    answer: "Donations from registration benefit Intermountain Cancer Center Utah Valley in Provo. We are seeking sponsors to cover the cost of putting on the race, so that as much of what you give as possible reaches the cancer center.",
  },
  {
    question: "Is this a timed race?",
    answer: "Yes — we have timers at the start and finish line. That said, the heart of this event is pushing yourself and giving to something bigger. It's not about winning or competing; it's about showing up.",
  },
  {
    question: "I can't run but I want to support. Can I just donate?",
    answer: "Absolutely, and we would love for you to still come pick up a packet with your complimentary bandana and support other racers if you'd like.",
  },
];
