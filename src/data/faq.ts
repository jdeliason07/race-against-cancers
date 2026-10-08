import {
  CHARITY_NAME,
  CONTACT_EMAIL,
  MAX_PARTICIPANTS_PER_REGISTRATION,
  RECOMMENDED_DONATION_AMOUNT,
  RECOMMENDED_DONATION_5K,
  RECOMMENDED_DONATION_FUN_RUN,
  REFERRAL_ENABLED,
  REFERRAL_REWARD,
  REGISTRATION_OPEN,
  REGISTRATION_OPENS_LABEL,
  EVENT_LOCATION_NAME,
  EVENT_CITY,
  ORG_NAME,
  ORG_EIN,
  TEN_K_START_TIME,
  FIVE_K_START_TIME,
  FUN_RUN_START_TIME,
  TEN_K_CHECK_IN_TIME,
  FIVE_K_CHECK_IN_TIME,
  FUN_RUN_CHECK_IN_TIME,
  MIN_DONATION_DOLLARS,
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
    answer: `There is no flat entry fee — your registration is a tax-deductible donation, and 100% of it funds cancer treatment for patients at ${CHARITY_NAME}. We recommend $${RECOMMENDED_DONATION_AMOUNT} for the 10K, $${RECOMMENDED_DONATION_5K} for the 5K, and $${RECOMMENDED_DONATION_FUN_RUN} for the 1-Mile Walk. The recommendation is per athlete, so a family of four doing the walk is pointed at $${RECOMMENDED_DONATION_FUN_RUN * 4} — and you can register all four in one go. Money tight? Any amount of $${MIN_DONATION_DOLLARS} or more gets you in. We'd rather have you there.`,
  },
  {
    question: "Can I register a group, or pay for other people?",
    answer: `Yes. On the registration form, enter how many athletes you're registering and the recommended donation adjusts automatically — $${RECOMMENDED_DONATION_AMOUNT} per athlete for the 10K, $${RECOMMENDED_DONATION_5K} for the 5K, $${RECOMMENDED_DONATION_FUN_RUN} for the 1-Mile Walk. This works for a family, a team, a company, or anyone who wants to cover entries for others. You give us your contact details once; each athlete's name and waiver are collected at check-in on race morning. For groups larger than ${MAX_PARTICIPANTS_PER_REGISTRATION}, email ${CONTACT_EMAIL} and we'll sort it out with you.`,
  },
  {
    question: "Can I register without fundraising?",
    answer: "Yes. There is no peer-to-peer fundraising requirement. Your donation at registration is all that's needed. You won't be asked to recruit other donors or hit a fundraising goal.",
  },
  {
    question: "What's the difference between the 10K, the 5K, and the 1-Mile Walk?",
    answer: `All three take place inside ${EVENT_LOCATION_NAME} in ${EVENT_CITY}, run as loops of the park, and start and finish in the same spot. The 10K (6.2 miles) starts at ${TEN_K_START_TIME}, with a $${RECOMMENDED_DONATION_AMOUNT} recommended donation. The 5K (3.1 miles) starts at ${FIVE_K_START_TIME}, with a $${RECOMMENDED_DONATION_5K} recommendation. The 1-Mile Walk starts at ${FUN_RUN_START_TIME}, with a $${RECOMMENDED_DONATION_FUN_RUN} recommendation — it's the one families choose: short enough for kids, easy to walk the whole way, and strollers are welcome.`,
  },
  {
    question: "Where is the race?",
    answer: `Every race starts and finishes at ${EVENT_LOCATION_NAME} in ${EVENT_CITY}. Check-in, start, and finish are all in the park, so there's no shuttle and no getting back to your car from somewhere else. Directions are on the Race Details page.`,
  },
  {
    question: "What's included with registration?",
    answer: "Every participant gets a race bib and a bandana in the color of the cancer they choose to run for. You pick your color when you register, and both are waiting for you at check-in. There are no shirts or medals — we'd rather that money go to treatment.",
  },
  {
    question: "What is the refund policy?",
    answer: "Donations are non-refundable. Registration transfers are available until October 1, 2026 — reach out to us directly to arrange a transfer.",
  },
  {
    question: "When and where is check-in?",
    answer: `Check in 30 minutes before your race at ${EVENT_LOCATION_NAME}: ${TEN_K_CHECK_IN_TIME} for the 10K, ${FIVE_K_CHECK_IN_TIME} for the 5K, and ${FUN_RUN_CHECK_IN_TIME} for the 1-Mile Walk. Your bib and bandana will be there.`,
  },
  {
    question: "Where does my donation go?",
    answer: `100% of every donation funds cancer treatment for patients at ${CHARITY_NAME} — this year, three local families. None of it goes to race expenses.`,
  },
  {
    question: "Is my donation tax-deductible?",
    answer: `Yes. ${ORG_NAME} is a registered 501(c)(3) nonprofit (EIN ${ORG_EIN}), and your registration donation is tax-deductible to the extent allowed by law. Your receipt is emailed to you after you register.`,
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
