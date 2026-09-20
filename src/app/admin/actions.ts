'use server';
import type Stripe from 'stripe';
import { CONTACT_EMAIL, EVENT_NAME, ORG_NAME } from '@/config/site';
import { checkPassword, denyUnlessAdmin, endSession, startSession } from '@/lib/adminAuth';
import {
  eachEventCustomer,
  getStripe,
  isIncompleteRegistration,
  paidCustomerIds,
  WAITLIST_SOURCE,
} from '@/lib/stripeRegistration';
import {
  createCampaign,
  deleteCampaign,
  getCampaignHtml,
  isSenderConfigured,
  listGroups,
  sendCampaign,
  sendTransactional,
  addSubscribersToGroup,
  createSubscriber,
  type SenderGroup,
} from '@/lib/senderNet';

export type ActionResult = { ok: true; message: string } | { error: string };

export async function signIn(password: string): Promise<{ ok: true } | { error: string }> {
  if (!checkPassword(password)) {
    return { error: 'Wrong password.' };
  }
  await startSession();
  return { ok: true };
}

export async function signOut(): Promise<void> {
  await endSession();
}

export async function fetchGroups(): Promise<{ groups: SenderGroup[] } | { error: string }> {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  if (!isSenderConfigured()) return { error: 'SENDER_API_TOKEN is not set.' };
  try {
    return { groups: await listGroups() };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Could not load groups.' };
  }
}

export type Audience = 'waitlist' | 'registered' | 'incomplete';

/** What each audience is called in the messages this action returns. */
const AUDIENCE_LABEL: Record<Audience, string> = {
  waitlist: 'waitlist signups',
  registered: 'registrations',
  incomplete: 'unfinished registrations',
};

/**
 * Copies people from Stripe into a Sender group — waitlist signups, completed
 * registrations, or the people who started registering and never paid.
 *
 * Sender is the list of record for sending: it owns unsubscribes, and bulk
 * email has to honour those. Stripe stays the list of record for who signed up.
 */
export async function syncAudienceToGroup(
  audience: Audience,
  groupId: string,
): Promise<ActionResult> {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  if (!isSenderConfigured()) return { error: 'SENDER_API_TOKEN is not set.' };
  if (!groupId) return { error: 'Choose a group to sync into.' };

  const stripe = getStripe();
  if (!stripe) return { error: 'Stripe is not configured.' };

  try {
    const people: Array<{ email: string; firstname: string; lastname: string; phone: string }> = [];
    // One subscriber per address. Two customer records can share an email — an
    // old record plus one made before the canonical-lowercase rule — and
    // sending the same person the same campaign twice is the kind of mistake
    // people notice.
    const seen = new Set<string>();

    const collect = (customer: Stripe.Customer) => {
      if (!customer.email) return;
      const key = customer.email.trim().toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      const [firstname = '', ...rest] = (customer.name ?? '').trim().split(/\s+/);
      people.push({
        email: customer.email,
        firstname,
        lastname: rest.join(' '),
        phone: customer.phone ?? '',
      });
    };

    if (audience === 'incomplete') {
      // Stripe's search matches metadata exactly and can't ask for "has a
      // startedRegistrationAt", so this walks the event's customers and
      // filters here. The paid set is what protects people whose payment
      // succeeded but whose webhook never landed — see paidCustomerIds.
      const paid = await paidCustomerIds(stripe);
      await eachEventCustomer(stripe, (customer) => {
        if (!isIncompleteRegistration(customer)) return;
        if (paid.has(customer.id)) return;
        collect(customer);
      });
    } else {
      // Registrations are flagged on the customer by the webhook; waitlist
      // signups carry the pre-signup source and haven't converted.
      const query =
        audience === 'registered'
          ? `metadata['registered']:'true' AND metadata['event']:'${EVENT_NAME}'`
          : `metadata['source']:'${WAITLIST_SOURCE}' AND metadata['event']:'${EVENT_NAME}'`;

      await stripe.customers.search({ query, limit: 100 }).autoPagingEach((customer) => {
        if (audience === 'waitlist') {
          if (customer.metadata?.registered === 'true') return;
          // A waitlister who went on to start a registration belongs to the
          // unfinished audience instead — otherwise the two groups overlap and
          // they get both emails, the wrong one of them asking them to do
          // something they already did.
          if (customer.metadata?.startedRegistrationAt) return;
        }
        collect(customer);
      });
    }

    if (people.length === 0) {
      return {
        error: `No ${AUDIENCE_LABEL[audience]} in Stripe to sync yet.`,
      };
    }

    // Two paths, because Sender separates them: creating a subscriber it has
    // never seen, and adding one it already knows to another group. Anyone
    // synced into a previous group falls into the second case, so trying only
    // the first fails for every one of them.
    let created = 0;
    const alreadyExist: string[] = [];
    let phonesDropped = 0;
    let firstCreateError = '';

    for (const person of people) {
      try {
        await createSubscriber({ ...person, groups: [groupId] });
        created++;
        continue;
      } catch (err) {
        if (!firstCreateError) firstCreateError = err instanceof Error ? err.message : String(err);
      }

      // Phone is the field most likely to be refused and the least important
      // here, so retry without it before treating them as pre-existing.
      if (person.phone) {
        try {
          await createSubscriber({ ...person, phone: '', groups: [groupId] });
          created++;
          phonesDropped++;
          continue;
        } catch {
          // fall through
        }
      }

      alreadyExist.push(person.email);
    }

    let addedToGroup = 0;
    let groupAddError = '';
    if (alreadyExist.length > 0) {
      // Batched — Sender takes a list of emails per call.
      const BATCH = 100;
      for (let i = 0; i < alreadyExist.length; i += BATCH) {
        const batch = alreadyExist.slice(i, i + BATCH);
        try {
          await addSubscribersToGroup(groupId, batch);
          addedToGroup += batch.length;
        } catch (err) {
          if (!groupAddError) groupAddError = err instanceof Error ? err.message : String(err);
        }
      }
    }

    const total = created + addedToGroup;
    if (total === 0) {
      return {
        error:
          `None of the ${people.length} people synced. ` +
          `Creating them failed with: ${firstCreateError || 'unknown error'}. ` +
          `Adding the existing ones to the group failed with: ${groupAddError || 'not attempted'}.`,
      };
    }

    const parts = [
      `${total} of ${people.length} ${AUDIENCE_LABEL[audience]} are now in this group`,
    ];
    if (created) parts.push(`${created} newly created`);
    if (addedToGroup) parts.push(`${addedToGroup} already existed and were added`);
    if (phonesDropped) parts.push(`${phonesDropped} without a phone number Sender would accept`);
    const remaining = people.length - total;
    if (remaining > 0) parts.push(`${remaining} failed: ${groupAddError || firstCreateError}`);

    return { ok: true, message: `${parts.join(' — ')}.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Sync failed.' };
  }
}

const FOOTER_STYLE =
  'margin:32px 0 0;padding-top:16px;border-top:1px solid #ECE2E6;font-size:13px;line-height:1.5;color:#6E5C64;';

/**
 * Sender refuses to send a campaign whose HTML has no unsubscribe link. The
 * campaign is created happily and then POST /campaigns/<id>/send comes back
 * 403 naming the anchor it wants, so the anchor goes in exactly as they print
 * it — no style attribute, no reworded label — because the check looks for
 * that literal snippet.
 */
// Not exported: a 'use server' module may only export async functions, and one
// stray const turns every action in the file into a missing import.
const UNSUBSCRIBE_ANCHOR = '<a href="{{unsubscribe_link}}">{{unsubscribe_text}}</a>';

const CAMPAIGN_FOOTER = `<p style="${FOOTER_STYLE}">
${ORG_NAME} · ${EVENT_NAME}<br />
${UNSUBSCRIBE_ANCHOR}
</p>`;

/**
 * The same footer for a test send, with the placeholders spelled out instead.
 *
 * Test sends go through the transactional endpoint, which doesn't substitute
 * them — a real `{{unsubscribe_link}}` would reach the inbox as raw braces.
 * This keeps the test a fair preview of the layout without pretending the link
 * is live.
 */
const PREVIEW_FOOTER = `<p style="${FOOTER_STYLE}">
${ORG_NAME} · ${EVENT_NAME}<br />
<em>The unsubscribe link goes here in the real send.</em>
</p>`;

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Plain text in, a complete HTML document out — so the composer stays a
 * textarea and nobody has to hand-write markup.
 *
 * A whole document, not a fragment: Sender stores campaign content starting at
 * `<!DOCTYPE html>` and parses it before deciding whether it carries an
 * unsubscribe link, and a loose `<div>` is not something every mail client
 * renders the same way either.
 */
function toHtml(body: string, subject: string, footer: 'campaign' | 'preview'): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p style="margin:0 0 16px;">${escapeHtml(block).replace(/\n/g, '<br />')}</p>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:24px;background-color:#ffffff;">
<div style="font-family:system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.6;color:#1C1719;max-width:600px;margin:0 auto;">
${paragraphs}
${footer === 'campaign' ? CAMPAIGN_FOOTER : PREVIEW_FOOTER}
</div>
</body>
</html>`;
}

export async function sendTestEmail(data: {
  toEmail: string;
  subject: string;
  body: string;
}): Promise<ActionResult> {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  if (!isSenderConfigured()) return { error: 'SENDER_API_TOKEN is not set.' };
  if (!data.toEmail.trim()) return { error: 'Enter an email address to send the test to.' };
  if (!data.subject.trim() || !data.body.trim()) {
    return { error: 'Subject and message are both required.' };
  }

  try {
    await sendTransactional({
      toEmail: data.toEmail.trim(),
      fromEmail: process.env.SENDER_FROM_EMAIL?.trim() || CONTACT_EMAIL,
      fromName: ORG_NAME,
      subject: `[TEST] ${data.subject.trim()}`,
      html: toHtml(data.body, data.subject.trim(), 'preview'),
      text: data.body,
    });
    return { ok: true, message: `Test sent to ${data.toEmail.trim()}.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Test send failed.' };
  }
}

/**
 * Creates the campaign in Sender and starts it. There is no undo once this
 * returns — the UI requires a typed confirmation before calling it.
 */
export async function sendCampaignToGroup(data: {
  groupId: string;
  subject: string;
  body: string;
  preheader: string;
}): Promise<ActionResult> {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  if (!isSenderConfigured()) return { error: 'SENDER_API_TOKEN is not set.' };
  if (!data.groupId) return { error: 'Choose a group to send to.' };
  if (!data.subject.trim()) return { error: 'Enter a subject line.' };
  if (!data.body.trim()) return { error: 'Write a message before sending.' };

  let campaignId: string;
  try {
    campaignId = await createCampaign({
      title: `${data.subject.trim()} — ${new Date().toISOString().slice(0, 10)}`,
      subject: data.subject.trim(),
      from: ORG_NAME,
      replyTo: process.env.SENDER_FROM_EMAIL?.trim() || CONTACT_EMAIL,
      preheader: data.preheader.trim(),
      html: toHtml(data.body, data.subject.trim(), 'campaign'),
      groups: [data.groupId],
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Could not create the campaign.' };
  }

  // The two calls are reported apart on purpose. Sender validates content at
  // send time, so creating succeeds and sending fails — against a campaign that
  // now exists as a draft nobody asked for.
  try {
    await sendCampaign(campaignId);
  } catch (err) {
    return { error: await explainSendFailure(campaignId, err) };
  }

  return {
    ok: true,
    message: `Campaign ${campaignId} is sending. Delivery reports are in Sender.`,
  };
}

/**
 * Turns a refused send into something actionable.
 *
 * Sender validates at send time and says only what it wants, not what it has,
 * which leaves the useful question unanswered: did our HTML reach them intact?
 * Reading the campaign back separates "they rejected our content" from "our
 * content never landed", and the draft gets cleared either way so retries
 * don't silt up the account.
 */
async function explainSendFailure(campaignId: string, err: unknown): Promise<string> {
  const parts = [err instanceof Error ? err.message : 'Send failed.', 'Nothing went out.'];

  try {
    const stored = await getCampaignHtml(campaignId);
    if (!stored) {
      parts.push('Sender has no HTML stored for this campaign — the content never reached it.');
    } else if (!stored.includes(UNSUBSCRIBE_ANCHOR)) {
      parts.push(
        `Sender stored ${stored.length} characters of HTML, but not the unsubscribe link we sent — it altered or dropped it.`,
      );
    } else {
      parts.push('The unsubscribe link is in the HTML Sender stored, so it is refusing for another reason.');
    }
  } catch (readErr) {
    parts.push(
      `Could not read the campaign back: ${readErr instanceof Error ? readErr.message : String(readErr)}.`,
    );
  }

  try {
    await deleteCampaign(campaignId);
    parts.push(`Draft ${campaignId} cleaned up.`);
  } catch {
    parts.push(`Draft ${campaignId} is still in Sender — delete it there.`);
  }

  return parts.join(' ');
}
