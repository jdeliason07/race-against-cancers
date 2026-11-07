// Server-only client for the Sender (sender.net) API v2.
// Docs: https://api.sender.net — auth is a bearer token from
// Settings → API access tokens, stored as SENDER_API_TOKEN.
const API_BASE = 'https://api.sender.net/v2';

export interface SenderGroup {
  id: string;
  title: string;
  recipientCount: number;
}

function token(): string | null {
  return process.env.SENDER_API_TOKEN?.trim() || null;
}

export function isSenderConfigured(): boolean {
  return token() !== null;
}

async function call<T>(
  path: string,
  init: { method: string; body?: unknown } = { method: 'GET' },
): Promise<T> {
  const key = token();
  if (!key) throw new Error('SENDER_API_TOKEN is not set.');

  const send = () =>
    fetch(`${API_BASE}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
    });

  // Parallel syncs can trip Sender's rate limit. Back off and retry rather than
  // count a throttled subscriber as one that already exists.
  let response = await send();
  for (let attempt = 0; response.status === 429 && attempt < 3; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    response = await send();
  }

  const raw = await response.text();
  if (!response.ok) {
    // Sender returns validation detail in the body; surfacing it beats "500".
    throw new Error(`Sender API ${response.status} on ${path}: ${raw.slice(0, 500)}`);
  }
  return (raw ? JSON.parse(raw) : {}) as T;
}

export async function listGroups(): Promise<SenderGroup[]> {
  const result = await call<{
    data?: Array<{ id: string; title: string; recipient_count?: number }>;
  }>('/groups');
  return (result.data ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    recipientCount: g.recipient_count ?? 0,
  }));
}

export interface SenderCampaign {
  id: string;
  title: string;
  subject: string;
  status: string;
  sentAt: string | null;
  recipients: number;
  sent: number;
  opens: number;
  clicks: number;
  bounces: number;
}

export async function listCampaigns(limit = 10): Promise<SenderCampaign[]> {
  const result = await call<{
    data?: Array<{
      id: string;
      title?: string;
      subject?: string;
      status?: string;
      sent_time?: string | null;
      recipient_count?: number;
      sent_count?: number;
      opens?: number;
      clicks?: number;
      bounces_count?: number;
    }>;
  }>(`/campaigns?limit=${limit}`);

  return (result.data ?? []).map((c) => ({
    id: c.id,
    title: c.title ?? '',
    subject: c.subject ?? '',
    status: c.status ?? '',
    sentAt: c.sent_time ?? null,
    recipients: c.recipient_count ?? 0,
    sent: c.sent_count ?? 0,
    opens: c.opens ?? 0,
    clicks: c.clicks ?? 0,
    bounces: c.bounces_count ?? 0,
  }));
}

/**
 * Creates a subscriber and assigns them to groups, carrying name and phone.
 *
 * This only works for an email Sender hasn't seen before — it rejects one that
 * already exists rather than updating it. Use `addSubscribersToGroup` to put
 * existing subscribers into another group.
 */
export async function createSubscriber(subscriber: {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  groups: string[];
}): Promise<void> {
  await call('/subscribers', {
    method: 'POST',
    body: {
      email: subscriber.email,
      firstname: subscriber.firstname || undefined,
      lastname: subscriber.lastname || undefined,
      // Sender wants E.164, which is exactly how we store phone numbers.
      phone: subscriber.phone || undefined,
      groups: subscriber.groups,
      trigger_automation: false,
    },
  });
}

/**
 * Adds subscribers who already exist to a group, by email, in one call.
 * This is the path for anyone Sender already knows — including everyone added
 * by a previous sync into a different group.
 */
export async function addSubscribersToGroup(groupId: string, emails: string[]): Promise<void> {
  await call(`/subscribers/groups/${encodeURIComponent(groupId)}`, {
    method: 'POST',
    body: { subscribers: emails, trigger_automation: false },
  });
}

export async function createCampaign(campaign: {
  title: string;
  subject: string;
  from: string;
  replyTo: string;
  html: string;
  groups: string[];
  preheader?: string;
}): Promise<string> {
  const result = await call<{ data?: { id?: string }; id?: string }>('/campaigns', {
    method: 'POST',
    body: {
      title: campaign.title,
      subject: campaign.subject,
      from: campaign.from,
      reply_to: campaign.replyTo,
      preheader: campaign.preheader || undefined,
      content_type: 'html',
      content: campaign.html,
      groups: campaign.groups,
    },
  });

  const id = result.data?.id ?? result.id;
  if (!id) throw new Error('Sender did not return a campaign id.');
  return id;
}

/** Starts the send. Sender delivers asynchronously — this returns immediately. */
export async function sendCampaign(campaignId: string): Promise<void> {
  await call(`/campaigns/${encodeURIComponent(campaignId)}/send`, { method: 'POST' });
}

/**
 * The HTML Sender actually stored for a campaign, as we supplied it.
 *
 * `html_content` is our markup; `html_body` is their processed copy with
 * tracking woven in. Reading the first one back is the only way to tell a
 * campaign that Sender rejected from one whose content never landed.
 */
export async function getCampaignHtml(campaignId: string): Promise<string> {
  const result = await call<{ data?: { html?: { html_content?: string } } }>(
    `/campaigns/${encodeURIComponent(campaignId)}`,
  );
  return result.data?.html?.html_content ?? '';
}

/** Removes a campaign. Used to clear the draft a failed send leaves behind. */
export async function deleteCampaign(campaignId: string): Promise<void> {
  // Sender takes the ids as a bracketed list in the query string, not a body.
  await call(`/campaigns?ids=[${encodeURIComponent(campaignId)}]`, { method: 'DELETE' });
}

/** One-off email that bypasses groups and campaigns — used for test sends and
 *  the weekly referral report. */
export async function sendTransactional(message: {
  toEmail: string;
  toName?: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  await call('/message/send', {
    method: 'POST',
    body: {
      from: { email: message.fromEmail, name: message.fromName },
      to: { email: message.toEmail, name: message.toName || undefined },
      subject: message.subject,
      html: message.html,
      text: message.text || undefined,
    },
  });
}
