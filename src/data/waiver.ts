// ============================================================
// PARTICIPANT AGREEMENT (THE "WAIVER")
// ============================================================
// The legal text every registrant accepts at checkout, kept here as data so
// there is exactly one copy of it. It is rendered in two places:
//   • the scroll box in the register flow (src/components/legal/WaiverText.tsx)
//   • the full-page version at /waiver
//
// Version 2.0 is final: reviewed and approved by the organizer's legal
// counsel, and it is the version registrants accept.
//
// Section 11.9 of the agreement makes the accepted VERSION the thing that
// controls, so WAIVER_VERSION below is written into every registration's Stripe
// metadata. Once a single registration has been recorded against a version, its
// wording is frozen: never edit it in place. Change the text and bump
// WAIVER_VERSION together, so a stored version string always points at the
// words that person actually agreed to.
//
// Plain apostrophes and quotes are fine here: these strings are rendered as
// text nodes, not written as JSX, so React escapes them for us.
// ============================================================

/** Written into Stripe metadata on every registration. Bump with the text. */
export const WAIVER_VERSION = '2.0';

/**
 * The date this version took effect, shown in the document header.
 *
 * This is the day registration opened, not race day, because registrants
 * accept the agreement when they register and Section 1.2 defines the Event to
 * include registration, packet pickup, and everything else leading up to the
 * race. The agreement is therefore in force for every acceptance it receives
 * and every activity it covers.
 */
export const WAIVER_EFFECTIVE_DATE = 'September 15, 2026';

/** The Event location as the document states it, for the header block. */
export const WAIVER_EVENT_LOCATION = 'Provo, Utah';

/** Used for page titles, headings, and the checkbox label. */
export const WAIVER_SHORT_TITLE = 'Participant Agreement';

/** The rest of the document's formal title, shown under the heading. */
export const WAIVER_SUBTITLE =
  'Assumption of Risk, Release of Liability, and Indemnification';

/** The all-caps warning that opens the document. */
export const WAIVER_PREAMBLE =
  'PLEASE READ THIS AGREEMENT CAREFULLY BEFORE REGISTERING. IT IS A LEGALLY BINDING CONTRACT. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO BRING CERTAIN CLAIMS AGAINST THE ORGANIZER AND OTHER RELEASED PARTIES FOR ORDINARY NEGLIGENCE. BY ACCEPTING THIS AGREEMENT, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND IT AND AGREE TO BE BOUND BY ITS TERMS.';

/** The final section's heading. Its number is derived from WAIVER_SECTIONS. */
export const WAIVER_ACKNOWLEDGMENT_HEADING = 'Acknowledgment and Acceptance';

/** The acknowledgment paragraph, shown directly above the accept checkbox. */
export const WAIVER_ACKNOWLEDGMENT =
  'I HAVE READ THIS PARTICIPANT AGREEMENT, ASSUMPTION OF RISK, RELEASE OF LIABILITY, AND INDEMNIFICATION. I UNDERSTAND THAT PARTICIPATION IN THE EVENT INVOLVES RISKS OF SERIOUS INJURY, DISABILITY, DEATH, AND PROPERTY LOSS. I UNDERSTAND THAT I AM RELEASING CERTAIN CLAIMS AGAINST THE RELEASEES, INCLUDING CLAIMS ARISING FROM THEIR ORDINARY NEGLIGENCE, TO THE FULLEST EXTENT PERMITTED BY UTAH LAW. I HAVE HAD AN OPPORTUNITY TO READ THIS AGREEMENT AND AGREE TO ITS TERMS VOLUNTARILY.';

/**
 * The two ways a person can accept, from Section 12. The register flow picks
 * one of these for its checkbox based on the athlete's age; the /waiver page
 * lists both.
 */
export const WAIVER_ACCEPTANCE_ADULT =
  'I am 18 or older and I agree to the terms of this Agreement.';
export const WAIVER_ACCEPTANCE_GUARDIAN =
  'I am the parent or legal guardian of a Participant under 18, I have authority to consent to the Participant’s participation, and I agree to the terms applicable to me as set forth in Section 10.';

export interface WaiverClause {
  /** The clause number as it appears in the document, e.g. '1.1'. */
  id: string;
  /** Bolded lead-in, e.g. 'Non-refundable.' — omitted on most clauses. */
  lead?: string;
  text: string;
  /** Bulleted items hanging off the clause. */
  items?: string[];
  /** An unnumbered paragraph that continues the clause after its items. */
  trailing?: string;
}

export interface WaiverSection {
  number: number;
  heading: string;
  clauses: WaiverClause[];
}

export const WAIVER_SECTIONS: WaiverSection[] = [
  {
    number: 1,
    heading: 'Definitions',
    clauses: [
      {
        id: '1.1',
        text: '"Organizer" means Race Against Cancers, Inc., a Utah nonprofit corporation.',
      },
      {
        id: '1.2',
        text: '"Event" means the Race Against Cancers 10K & Fun Run scheduled for Saturday, November 7, 2026, in Provo, Utah, together with all related and ancillary activities, whether occurring before, during, or after the race, including online and in-person registration, packet pickup, any expo, warm-up and staging areas, the start and finish areas, the race course, parking, shuttles and transportation provided or arranged by the Organizer, aid stations, medical areas, awards ceremonies, post-race activities, and any rescheduled, relocated, modified, or virtual version of the Event.',
      },
      {
        id: '1.3',
        text: '"Participant" means an individual who registers for or participates in the Event, including runners, walkers, wheelchair and adaptive athletes, and pacers. A person accompanying a Participant on the course is also considered a Participant for purposes of applicable Event rules.',
      },
      {
        id: '1.4',
        text: '"Releasees" means, collectively and to the extent actually involved in or connected with the Event: the Organizer; Intermountain Health, Intermountain Cancer Center Utah Valley, and their applicable affiliates; Brigham Young University and any other owner, lessor, or operator of property used for the Event; Provo City, Utah County, the State of Utah, the Utah Department of Transportation, and other governmental entities whose property, roads, or personnel are used in connection with the Event; sponsors, co-sponsors, donors, and promotional partners; timing, logistics, security, medical, emergency-services, photography, technology, registration-platform, and other vendors, contractors, and subcontractors providing goods or services for the Event; race officials; course marshals; medical and first-aid personnel; volunteers; and other Participants.',
        trailing:
          '"Releasees" also includes the foregoing parties’ respective officers, directors, trustees, board members, managers, members, employees, agents, representatives, contractors, volunteers, insurers, successors, and assigns, but only to the extent applicable to their involvement with the Event.',
      },
    ],
  },
  {
    number: 2,
    heading: 'Eligibility, Fitness, and Medical Representations',
    clauses: [
      {
        id: '2.1',
        text: 'The Participant represents that, to the best of the Participant’s knowledge, the Participant is physically capable of participating in the Event and has adequately prepared for the distance and conditions involved.',
      },
      {
        id: '2.2',
        text: 'The Participant acknowledges that the Organizer does not perform medical screening and that the Participant is responsible for determining whether participation is appropriate based on the Participant’s own health and physical condition. Participants are encouraged to consult a physician or other qualified medical professional when appropriate before participating.',
      },
      {
        id: '2.3',
        text: 'The Participant agrees to stop participating and seek assistance if the Participant experiences chest pain, dizziness, disorientation, unusual shortness of breath, extreme fatigue, injury, or any other warning sign of medical distress.',
      },
      {
        id: '2.4',
        text: 'The Participant acknowledges that the Organizer does not provide health, accident, disability, or life insurance to Participants and that the Participant is responsible for the Participant’s own medical and other personal expenses, except to the extent otherwise required by law or covered by applicable insurance.',
      },
      {
        id: '2.5',
        text: 'The Participant represents that all information supplied during registration, including name, age, emergency contact information, and other requested information, is accurate and complete.',
      },
    ],
  },
  {
    number: 3,
    heading: 'Assumption of Risk',
    clauses: [
      {
        id: '3.1',
        text: 'The Participant understands that participation in a road race is an inherently physical and potentially dangerous activity that involves risks of serious bodily injury, permanent disability, paralysis, death, and property loss or damage.',
      },
      {
        id: '3.2',
        text: 'The Participant knowingly and voluntarily assumes the risks associated with participation, including, without limitation:',
        items: [
          'falls, trips, slips, and collisions;',
          'contact with Participants, spectators, pedestrians, animals, bicycles, motor vehicles, or fixed objects;',
          'road, sidewalk, curb, gutter, crossing, pavement, surface, grade, camber, obstruction, or other course conditions;',
          'inadequate, missing, altered, or confusing course markings, signage, barricades, or directions;',
          'traffic and the failure of motorists or other persons to obey traffic laws or traffic-control instructions;',
          'errors or omissions by Participants, spectators, volunteers, officials, course marshals, or third parties;',
          'cardiac arrest, heart attack, stroke, and other cardiovascular events;',
          'heat illness, heat stroke, hyperthermia, hypothermia, frostbite, sunburn, dehydration, overhydration, hyponatremia, and electrolyte imbalance;',
          'aggravation of pre-existing conditions, whether known or unknown;',
          'communicable diseases and exposure to infectious illnesses;',
          'insect and animal bites or stings;',
          'allergic reactions to food, beverages, or other products;',
          'weather conditions including heat, cold, wind, rain, snow, ice, lightning, and poor air quality;',
          'theft, loss, or damage to personal property;',
          'transportation to, from, or during the Event;',
          'actions or omissions of other Participants, spectators, volunteers, vendors, contractors, governmental personnel, or other third parties;',
          'the rendering, delay in rendering, or failure to render first aid, medical treatment, or emergency transportation; and',
          'other risks inherent in or reasonably associated with participation in the Event.',
        ],
      },
      {
        id: '3.3',
        text: 'The Participant understands that the Organizer will take reasonable measures appropriate to the Event to organize and administer the race, but no safety measure can eliminate every risk associated with participation.',
      },
      {
        id: '3.4',
        text: 'The Participant knowingly and voluntarily assumes the risks described above, including risks arising from the ordinary negligence of a Releasee, to the fullest extent such assumption of risk and release is permitted under Utah law.',
      },
    ],
  },
  {
    number: 4,
    heading: 'Release and Waiver of Liability; Covenant Not to Sue',
    clauses: [
      {
        id: '4.1',
        text: 'In consideration of being permitted to register for and participate in the Event, the Participant, on behalf of the Participant personally, voluntarily releases, waives, discharges, and covenants not to sue the Releasees for claims arising out of or relating to the Participant’s registration for, travel to or from, presence at, or participation in the Event, including claims for personal injury, illness, disability, death, emotional distress, or loss of or damage to property, to the fullest extent permitted by Utah law.',
      },
      {
        id: '4.2',
        text: 'This release expressly includes claims arising from the ordinary negligence of a Releasee, including ordinary negligence relating to the Event, course conditions, premises, organization, supervision, direction, or administration of the Event, to the fullest extent permitted by Utah law.',
      },
      {
        id: '4.3',
        text: 'The Participant understands and agrees that this release is intended to be as broad and inclusive as Utah law permits, but it does not release or waive claims based on gross negligence, willful or wanton misconduct, intentional misconduct, or any other liability that cannot lawfully be released or waived under applicable law.',
      },
      {
        id: '4.4',
        text: 'Nothing in this Agreement is intended to eliminate any right or protection that cannot legally be waived under Utah law.',
      },
    ],
  },
  {
    number: 5,
    heading: 'Participant Responsibility and Indemnification',
    clauses: [
      {
        id: '5.1',
        text: 'The Participant agrees to be responsible for the Participant’s own acts and omissions in connection with the Event.',
      },
      {
        id: '5.2',
        text: 'To the fullest extent permitted by Utah law, the Participant agrees to indemnify and hold harmless the Releasees from third-party claims, damages, losses, liabilities, and reasonable expenses, including reasonable attorneys’ fees, to the extent caused by the Participant’s own negligent, reckless, or intentional acts or omissions, violation of Event rules, or damage to persons or property.',
      },
      {
        id: '5.3',
        text: 'This indemnification obligation does not apply to the extent that the claim or loss was caused by the negligence, gross negligence, willful misconduct, or other legally actionable conduct of a Releasee, except to the extent otherwise permitted by applicable law.',
      },
      {
        id: '5.4',
        text: 'Nothing in this Section requires a Participant to indemnify a Releasee for claims that Utah law prohibits from being shifted to the Participant.',
      },
    ],
  },
  {
    number: 6,
    heading: 'Medical Authorization and Expenses',
    clauses: [
      {
        id: '6.1',
        text: 'If the Participant becomes injured, ill, unconscious, or otherwise unable to provide informed consent, the Participant authorizes Event personnel and emergency responders to provide or arrange reasonable first aid, emergency medical care, transportation, and other emergency assistance consistent with the circumstances.',
      },
      {
        id: '6.2',
        text: 'The Participant understands that medical care, ambulance transportation, hospitalization, and other medical services may result in expenses for which the Participant is responsible, subject to applicable law and insurance coverage.',
      },
      {
        id: '6.3',
        text: 'The Participant releases the Releasees from claims arising from the good-faith provision, delay, or failure to provide emergency assistance or medical care, to the fullest extent permitted by Utah law.',
      },
    ],
  },
  {
    number: 7,
    heading: 'Rules, Conduct, and Event Authority',
    clauses: [
      {
        id: '7.1',
        text: 'The Participant agrees to comply with all Event rules, instructions from race officials, course marshals, medical personnel, law enforcement, and other authorized Event personnel, all posted signage, and all applicable laws and traffic regulations.',
      },
      {
        id: '7.2',
        text: 'The Participant may not:',
        items: [
          'participate without a valid and properly assigned bib;',
          'transfer, sell, or give a bib to another person except through the Organizer’s official transfer process;',
          'participate under another person’s registration;',
          'participate without registering;',
          'use unauthorized wheeled devices, skates, bicycles, or motorized conveyances;',
          'bring animals onto the course except as permitted by applicable law and Event rules;',
          'participate while impaired by alcohol or a controlled substance; or',
          'engage in conduct that creates an unreasonable safety risk to the Participant or another person.',
        ],
      },
      {
        id: '7.3',
        text: 'Strollers, pets, headphones, and accompanying non-registered persons are permitted only as expressly provided by the published Event rules.',
      },
      {
        id: '7.4',
        text: 'The Organizer and its authorized officials may, in their reasonable discretion, refuse or revoke entry, disqualify a Participant, or remove a Participant from the course or Event premises for safety concerns, medical concerns, failure to meet applicable course requirements, unsafe or unsportsmanlike conduct, or violation of this Agreement or Event rules.',
      },
      {
        id: '7.5',
        text: 'The Participant agrees to comply promptly with reasonable safety-related instructions from authorized Event personnel.',
      },
      {
        id: '7.6',
        text: 'Results, times, awards, and age-group placements are determined by the Organizer and its timing provider, subject to applicable Event rules.',
      },
    ],
  },
  {
    number: 8,
    heading: 'Media, Name, and Likeness Release',
    clauses: [
      {
        id: '8.1',
        text: 'The Participant grants the Organizer and its designees, licensees, sponsors, media partners, and successors a perpetual, worldwide, royalty-free right to photograph, record, film, stream, broadcast, reproduce, edit, publish, distribute, display, and otherwise use the Participant’s name, voice, image, likeness, race results, finish time, and statements made by the Participant in connection with the Event or the Organizer’s charitable mission, including promotional, fundraising, archival, and advertising purposes.',
      },
      {
        id: '8.2',
        text: 'The Participant waives the right to inspect or approve such use and waives claims for compensation arising solely from uses authorized by this Section.',
      },
      {
        id: '8.3',
        text: 'Race results may be publicly published and provided to timing and results platforms, including the Participant’s name, age or age group, city, bib number, and finish time.',
      },
    ],
  },
  {
    number: 9,
    heading: 'Registration Fees, Transfers, and Event Changes',
    clauses: [
      {
        id: '9.1',
        lead: 'Non-refundable.',
        text: 'Registration fees are non-refundable and non-deferrable except where the Organizer expressly provides otherwise or where required by law.',
      },
      {
        id: '9.2',
        lead: 'Donations and tax treatment.',
        text: 'The Organizer is a Utah nonprofit corporation. The Organizer accepts the registration amount as a charitable donation in support of its mission, and the Organizer in turn donates the proceeds of the Event to Intermountain Cancer Center Utah Valley. Because a Participant also receives goods and services in connection with the Event, including race entry, event materials, and on-course support, the portion of any payment that is deductible for tax purposes may be limited to the amount by which the payment exceeds the value of those benefits. Any separate voluntary donation will be treated separately for applicable tax purposes. The Organizer does not provide tax advice, and each Participant is responsible for determining the tax treatment of the Participant\u2019s own payment.',
      },
      {
        id: '9.3',
        lead: 'Transfers.',
        text: 'A registration may be transferred to another individual through the Organizer’s official transfer process until October 1, 2026. The transferee must complete the required registration process and accept this Agreement before participating.',
      },
      {
        id: '9.4',
        lead: 'Cancellation, postponement, and modification.',
        text: 'The Organizer may cancel, postpone, reschedule, relocate, shorten, reroute, convert to a virtual format, or otherwise modify the Event when reasonably necessary, including because of severe weather, lightning, air quality, fire, flood, earthquake, epidemic or pandemic, public-health requirements, civil unrest, loss of permits or venue access, unavailability of public-safety personnel, or other circumstances beyond the Organizer’s reasonable control.',
      },
      {
        id: '9.5',
        text: 'To the fullest extent permitted by law, the Participant agrees that the Organizer will not be responsible for travel, lodging, equipment, or other incidental expenses incurred by the Participant as a result of Event cancellation, postponement, relocation, or modification.',
      },
      {
        id: '9.6',
        text: 'The Organizer may, but is not required to, provide refunds, credits, deferrals, or other accommodations following cancellation, postponement, relocation, or modification.',
      },
    ],
  },
  {
    number: 10,
    heading: 'Participants Under 18',
    clauses: [
      {
        id: '10.1',
        text: 'A Participant under 18 may participate only with the consent of a parent or legal guardian.',
      },
      {
        id: '10.2',
        text: 'The parent or legal guardian represents that:',
        items: [
          'the parent or guardian has authority to consent to the minor’s participation;',
          'the parent or guardian has reviewed this Agreement with the minor to the extent appropriate;',
          'the parent or guardian has determined that participation is appropriate for the minor;',
          'the minor is reasonably prepared for the distance and conditions of the Event;',
          'the parent or guardian will be responsible for the minor’s supervision except to the extent the Organizer expressly assumes a specific supervisory responsibility; and',
          'the parent or guardian understands and accepts the risks associated with the minor’s participation.',
        ],
      },
      {
        id: '10.3',
        text: 'The parent or legal guardian releases and waives, in the guardian’s own individual capacity, any claims the guardian personally may have against the Releasees arising from the minor’s participation, to the fullest extent permitted by Utah law.',
      },
      {
        id: '10.4',
        text: 'The parent or legal guardian consents to the minor receiving reasonable emergency medical care as described in Section 6 and acknowledges responsibility for applicable medical expenses.',
      },
      {
        id: '10.5',
        text: 'The parent or legal guardian grants the media and likeness rights described in Section 8 with respect to the minor to the fullest extent permitted by law.',
      },
      {
        id: '10.6',
        text: 'Nothing in this Agreement purports to release, waive, or extinguish a minor’s own prospective legal claims to the extent Utah law prohibits such a release or waiver.',
      },
    ],
  },
  {
    number: 11,
    heading: 'Dispute Resolution and General Provisions',
    clauses: [
      {
        id: '11.1',
        lead: 'Governing law.',
        text: 'This Agreement is governed by the laws of the State of Utah.',
      },
      {
        id: '11.2',
        lead: 'Venue.',
        text: 'To the extent permitted by law, any action arising from this Agreement or the Event shall be brought in a court of competent jurisdiction in Utah County, Utah, subject to any mandatory venue provisions of applicable law.',
      },
      {
        id: '11.3',
        lead: 'Jury waiver.',
        text: 'TO THE FULLEST EXTENT PERMITTED BY LAW, the Participant and Organizer knowingly and voluntarily waive any right to trial by jury for claims arising out of or relating to this Agreement or the Event.',
      },
      {
        id: '11.4',
        lead: 'Severability.',
        text: 'If any provision of this Agreement is held invalid or unenforceable, that provision shall be modified or severed to the minimum extent necessary, and the remaining provisions shall remain in effect to the fullest extent permitted by law.',
      },
      {
        id: '11.5',
        lead: 'No waiver.',
        text: 'Failure by the Organizer to enforce any provision of this Agreement does not constitute a waiver of that provision.',
      },
      {
        id: '11.6',
        lead: 'Entire agreement.',
        text: 'This Agreement, together with the applicable published Event rules and any registration terms expressly incorporated into the registration process, constitutes the agreement between the Participant and Organizer concerning the subject matter addressed herein.',
      },
      {
        id: '11.7',
        lead: 'Third-party beneficiaries.',
        text: 'The Releasees are intended third-party beneficiaries of the release and other applicable protections contained in this Agreement and may enforce those provisions to the extent permitted by law.',
      },
      {
        id: '11.8',
        lead: 'Electronic acceptance.',
        text: 'Acceptance of this Agreement electronically constitutes a valid and binding signature to the fullest extent permitted by applicable law. The Organizer may retain an electronic record of acceptance, including the date, time, registration information, IP address, and version of the Agreement accepted.',
      },
      {
        id: '11.9',
        lead: 'Version control.',
        text: 'The version of this Agreement accepted by the Participant controls the Participant’s agreement to these terms. The Organizer may update the Agreement for future registrations by publishing a new version.',
      },
    ],
  },
];
