import {
  CHARITY_NAME,
  CONTACT_EMAIL,
  MAX_PARTICIPANTS_PER_REGISTRATION,
  RECOMMENDED_DONATION_AMOUNT,
  RECOMMENDED_DONATION_FUN_RUN,
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
    answer: `There is no flat entry fee and no donation minimum — your registration is simply a donation to ${CHARITY_NAME}. We recommend $${RECOMMENDED_DONATION_AMOUNT} for the 10K and $${RECOMMENDED_DONATION_FUN_RUN} for the family-friendly Fun Run. The recommendation is per athlete, so a family of four doing the Fun Run is pointed at $${RECOMMENDED_DONATION_FUN_RUN * 4} — and you can register all four in one go rather than filling in the form four times. Give more if you're able, or less if that's what works; every athlete is welcome either way.`,
  },
  {
    question: "Can I register a group, or pay for other people?",
    answer: `Yes. On the registration form, enter how many athletes you're registering and the recommended donation adjusts automatically — $${RECOMMENDED_DONATION_AMOUNT} per athlete for the 10K, $${RECOMMENDED_DONATION_FUN_RUN} per athlete for the Fun Run. This works for a family, a team, a company, or anyone who wants to cover entries for others. You give us your contact details once; each athlete's name and waiver are collected at check-in on race morning. For groups larger than ${MAX_PARTICIPANTS_PER_REGISTRATION}, email ${CONTACT_EMAIL} and we'll sort it out with you.`,
  },
  {
    question: "Can I register without fundraising?",
    answer: "Yes. There is no peer-to-peer fundraising requirement. Your donation at registration is all that's needed. You won't be asked to recruit other donors or hit a fundraising goal.",
  },
  {
    question: "What's the difference between the 10K and the Fun Run?",
    answer: `The 10K is 6.2 miles and follows a point-to-point, predominantly downhill route: it starts in front of Canyon Crest Elementary School on N Canyon Road, runs to the mouth of Provo Canyon, then makes its single turn onto University Avenue and heads straight to the finish at Center Street in downtown Provo. The recommended donation is $${RECOMMENDED_DONATION_AMOUNT}. The Fun Run is approximately 2 miles, starting at LaVell Edwards Stadium on the BYU campus and following University Avenue south to the same finish line, with a $${RECOMMENDED_DONATION_FUN_RUN} recommended donation. It's the one most families choose — short enough for kids to finish, easy to walk the whole way, and strollers are welcome. Both events take place on November 7, 2026.`,
  },
  {
    question: "How do I get to the 10K start line?",
    answer: "Because the 10K is point-to-point, runners are responsible for their own transportation to the start line at Canyon Crest Elementary School (4664 N Canyon Rd, Provo). Plan to arrive at check-in by 7:00 AM — the race starts promptly at 8:00 AM.",
  },
  {
    question: "How do I get to the Fun Run start?",
    answer: "The Fun Run starts at LaVell Edwards Stadium on the BYU campus in Provo. Participants are responsible for their own transportation to the stadium. Check-in is at the stadium — plan to arrive by 7:00 AM. The race starts promptly at 8:00 AM.",
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
    answer: "Check-in is on race morning — Saturday, November 7, 2026. 10K check-in is at 7:00 AM in the Canyon Crest Elementary School parking lot (4664 N Canyon Rd, Provo). Fun Run check-in is at 7:00 AM at LaVell Edwards Stadium. Your bib and bandana will be available at your respective check-in location.",
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
