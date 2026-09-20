// Weekly referral report, emailed to the organizer.
//
// Fired by the Vercel cron in vercel.json (Mondays). To run it by hand:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/referral-report
// It emails the report and returns it as JSON either way.
//
// Setup:
//   CRON_SECRET        any long random string; Vercel sends it as a Bearer token
//   SENDER_API_TOKEN   Sender (sender.net) → Settings → API access tokens
//   REPORT_EMAIL_TO    where the report goes (e.g. you)
//   SENDER_FROM_EMAIL  a verified sending address on your Sender account
import {
  CONTACT_EMAIL,
  EVENT_NAME,
  ORG_NAME,
  REFERRAL_ENABLED,
  REFERRAL_MIN_DONATION_DOLLARS,
  REFERRAL_REWARD,
} from '@/config/site';
import { getStripe } from '@/lib/stripeRegistration';
import { buildReferralReport, type ReferralReport } from '@/lib/referralReport';
import { isSenderConfigured, sendTransactional } from '@/lib/senderNet';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHtml(report: ReferralReport): string {
  if (report.rows.length === 0) {
    return `<p>No referrals recorded yet for ${escapeHtml(EVENT_NAME)}.</p>`;
  }

  const rows = report.rows
    .map(
      (row) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #ECE2E6;">${escapeHtml(row.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ECE2E6;text-align:right;font-weight:bold;">${row.newCount}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ECE2E6;text-align:right;">${row.totalCount}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ECE2E6;text-align:right;color:#6E5C64;">${row.belowMinimumCount || ''}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ECE2E6;color:#6E5C64;font-size:12px;">${escapeHtml(row.newlyReferred.join(', '))}</td>
      </tr>`,
    )
    .join('');

  const shortfall = report.belowMinimumTotal
    ? ` ${report.belowMinimumTotal} other referral(s) came with a donation under $${REFERRAL_MIN_DONATION_DOLLARS} and earn nothing.`
    : '';

  return `
    <p><strong>${report.newTotal}</strong> new reward(s) owed this week — <strong>${report.allTimeTotal}</strong> all time.</p>
    <p style="color:#6E5C64;font-size:13px;">Each one is a ${escapeHtml(REFERRAL_REWARD)}, earned only when that registration donated $${REFERRAL_MIN_DONATION_DOLLARS} or more.${shortfall} "This week" counts registrations completed since ${escapeHtml(report.sinceISO.slice(0, 10))}.</p>
    <table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px;">
      <thead>
        <tr style="text-align:left;">
          <th style="padding:8px 12px;border-bottom:2px solid #F0307A;">Referrer</th>
          <th style="padding:8px 12px;border-bottom:2px solid #F0307A;text-align:right;">This week</th>
          <th style="padding:8px 12px;border-bottom:2px solid #F0307A;text-align:right;">Owed</th>
          <th style="padding:8px 12px;border-bottom:2px solid #F0307A;text-align:right;">Under $${REFERRAL_MIN_DONATION_DOLLARS}</th>
          <th style="padding:8px 12px;border-bottom:2px solid #F0307A;">Newly referred</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="color:#6E5C64;font-size:12px;">Names are typed by registrants and aren't verified, so skim the right-hand column before sending gift cards.</p>`;
}

function renderText(report: ReferralReport): string {
  if (report.rows.length === 0) return `No referrals recorded yet for ${EVENT_NAME}.`;
  const lines = report.rows.map(
    (row) =>
      `${row.newCount} new (${row.totalCount} owed)  ${row.name}` +
      (row.belowMinimumCount ? `  [${row.belowMinimumCount} under $${REFERRAL_MIN_DONATION_DOLLARS}]` : ''),
  );
  return `${report.newTotal} new reward(s) owed this week, ${report.allTimeTotal} all time.\n\n${lines.join('\n')}`;
}

async function sendEmail(report: ReferralReport): Promise<void> {
  const to = process.env.REPORT_EMAIL_TO?.trim();
  if (!isSenderConfigured() || !to) {
    throw new Error('SENDER_API_TOKEN and REPORT_EMAIL_TO must both be set.');
  }

  await sendTransactional({
    toEmail: to,
    fromEmail: process.env.SENDER_FROM_EMAIL?.trim() || CONTACT_EMAIL,
    fromName: ORG_NAME,
    subject: `${EVENT_NAME} — ${report.newTotal} new referral(s) this week`,
    html: renderHtml(report),
    text: renderText(report),
  });
}

export async function GET(request: Request): Promise<Response> {
  // Vercel Cron sends CRON_SECRET as a Bearer token. Without this the endpoint
  // would hand anyone on the internet your registrants' names.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response('CRON_SECRET is not configured.', { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized.', { status: 401 });
  }

  if (!REFERRAL_ENABLED) {
    return Response.json({ skipped: 'Referral program is switched off in site.ts.' });
  }

  const stripe = getStripe();
  if (!stripe) {
    return new Response('Stripe is not configured.', { status: 500 });
  }

  try {
    const report = await buildReferralReport(stripe);
    await sendEmail(report);
    return Response.json({
      emailed: true,
      newTotal: report.newTotal,
      allTimeTotal: report.allTimeTotal,
      belowMinimumTotal: report.belowMinimumTotal,
      rows: report.rows,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Referral report failed:', err);
    return new Response(`Referral report failed: ${message}`, { status: 500 });
  }
}
