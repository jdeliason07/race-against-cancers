'use client';
import { useEffect, useState } from 'react';
import {
  fetchGroups,
  sendCampaignToGroup,
  sendTestEmail,
  signOut,
  syncAudienceToGroup,
  type ActionResult,
  type Audience,
} from './actions';
import type { SenderGroup } from '@/lib/senderNet';

const CONFIRM_WORD = 'SEND';

/** The sync buttons, in the order an organizer reaches for them. */
const SYNCS: ReadonlyArray<{ audience: Audience; label: string }> = [
  { audience: 'waitlist', label: 'Sync waitlist' },
  { audience: 'registered', label: 'Sync registrations' },
  { audience: 'incomplete', label: 'Sync incomplete' },
];

type SyncKind = `sync-${Audience}`;

const inputClass =
  'w-full rounded-card border border-line bg-paper px-4 py-3 font-body text-sm text-ink focus:border-pink focus:outline-none';
const labelClass = 'mb-1 block font-body text-xs font-bold uppercase tracking-widest text-ash';

/**
 * A server action can reject rather than return: a redeploy invalidates the
 * action ids this page was rendered with, the phone drops its connection, the
 * session lapses. Production strips the real message and leaves a digest, so
 * this says what to do instead of what broke — anything is better than the
 * silent nothing that made these buttons look dead.
 */
function failureMessage(err: unknown): string {
  const detail = err instanceof Error ? err.message : String(err);
  return `That didn't reach the server. Reload the page and sign in again if it asks. (${detail})`;
}

function Notice({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  const isError = 'error' in result;
  return (
    <p
      role="status"
      className={`mt-3 rounded-card border px-4 py-3 font-body text-sm ${
        isError
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-green-200 bg-green-50 text-green-800'
      }`}
    >
      {isError ? result.error : result.message}
    </p>
  );
}

export function EmailComposer({ defaultEmail }: { defaultEmail: string }) {
  const [groups, setGroups] = useState<SenderGroup[]>([]);
  const [groupsError, setGroupsError] = useState('');
  const [groupId, setGroupId] = useState('');

  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [body, setBody] = useState('');

  const [testEmail, setTestEmail] = useState(defaultEmail);
  const [confirmText, setConfirmText] = useState('');

  const [busy, setBusy] = useState<'' | SyncKind | 'test' | 'send'>('');
  const [syncResult, setSyncResult] = useState<ActionResult | null>(null);
  const [testResult, setTestResult] = useState<ActionResult | null>(null);
  const [sendResult, setSendResult] = useState<ActionResult | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchGroups()
      .then((result) => {
        if ('error' in result) setGroupsError(result.error);
        else {
          setGroups(result.groups);
          if (result.groups.length === 1) setGroupId(result.groups[0].id);
        }
      })
      .catch((err) => setGroupsError(failureMessage(err)));
  }, []);

  const selectedGroup = groups.find((g) => g.id === groupId);
  // Case-insensitive: iOS capitalises the first letter of a text field for you,
  // so a typed confirmation arrives as "Send" and the button silently refuses.
  const confirmed = confirmText.trim().toUpperCase() === CONFIRM_WORD;
  const canSend = !!groupId && !!subject.trim() && !!body.trim() && confirmed && !sent;

  // A disabled button with no explanation is indistinguishable from a broken
  // one — which is exactly how this read when the group list failed to load.
  const sendBlocker = sent
    ? ''
    : !groupId
      ? 'Pick a group in step 1 first.'
      : !subject.trim() || !body.trim()
        ? 'Add a subject and a message in step 2 first.'
        : !confirmed
          ? `Type ${CONFIRM_WORD} above to unlock this.`
          : '';

  async function run(kind: SyncKind | 'test' | 'send', audience?: Audience) {
    const report =
      kind === 'test' ? setTestResult : kind === 'send' ? setSendResult : setSyncResult;
    setBusy(kind);
    try {
      if (audience) setSyncResult(await syncAudienceToGroup(audience, groupId));
      if (kind === 'test') setTestResult(await sendTestEmail({ toEmail: testEmail, subject, body }));
      if (kind === 'send') {
        const result = await sendCampaignToGroup({ groupId, subject, body, preheader });
        setSendResult(result);
        if ('ok' in result) {
          setSent(true);
          setConfirmText('');
        }
      }
    } catch (err) {
      report({ error: failureMessage(err) });
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-10">
      {/* Audience */}
      <section>
        <h2 className="mb-4 font-display text-2xl uppercase text-ink">1. Pick the audience</h2>
        {groupsError ? (
          <p className="rounded-card border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
            {groupsError}
          </p>
        ) : (
          <>
            <label htmlFor="group" className={labelClass}>
              Sender group
            </label>
            <select
              id="group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className={inputClass}
            >
              <option value="">
                {groups.length ? 'Choose a group…' : 'Loading groups…'}
              </option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.title} ({group.recipientCount} subscribers)
                </option>
              ))}
            </select>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {SYNCS.map(({ audience, label }) => (
                <button
                  key={audience}
                  type="button"
                  onClick={() => run(`sync-${audience}`, audience)}
                  disabled={!groupId || busy !== ''}
                  className="btn-ghost disabled:opacity-40"
                >
                  {busy === `sync-${audience}` ? 'Syncing…' : label}
                </button>
              ))}
            </div>
            {/* Said plainly because the groups overlap: somebody who joined the
                waitlist and then abandoned the card form is in both, and an
                email written for one of them reads wrong to the other. */}
            <p className="mt-2 font-body text-xs text-ash">
              Incomplete: started the registration form and never paid. Someone can be on the
              waitlist and incomplete at the same time.
            </p>
            <Notice result={syncResult} />
          </>
        )}
      </section>

      {/* Compose */}
      <section>
        <h2 className="mb-4 font-display text-2xl uppercase text-ink">2. Write the email</h2>

        <div className="mb-4">
          <label htmlFor="subject" className={labelClass}>Subject</label>
          <input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
            placeholder="Registration is open!"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="preheader" className={labelClass}>
            Preview text <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="preheader"
            value={preheader}
            onChange={(e) => setPreheader(e.target.value)}
            className={inputClass}
            placeholder="The line shown after the subject in an inbox"
          />
        </div>

        <div>
          <label htmlFor="body" className={labelClass}>Message</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className={inputClass + ' font-body leading-relaxed'}
            placeholder={'Write in plain text.\n\nLeave a blank line between paragraphs.'}
          />
          <p className="mt-1 font-body text-xs text-ash">
            Plain text — blank lines become paragraphs. No HTML needed.
          </p>
        </div>
      </section>

      {/* Test */}
      <section>
        <h2 className="mb-4 font-display text-2xl uppercase text-ink">3. Send yourself a test</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            aria-label="Test recipient"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
          <button
            type="button"
            onClick={() => run('test')}
            disabled={busy !== '' || !subject.trim() || !body.trim()}
            className="btn-ghost shrink-0 disabled:opacity-40"
          >
            {busy === 'test' ? 'Sending…' : 'Send test'}
          </button>
        </div>
        <Notice result={testResult} />
      </section>

      {/* Send */}
      <section>
        <h2 className="mb-4 font-display text-2xl uppercase text-ink">4. Send for real</h2>
        <div className="rounded-card border-2 border-pink bg-blush p-5">
          <p className="font-body text-sm text-ink">
            {selectedGroup ? (
              <>
                This sends to <span className="font-bold">{selectedGroup.recipientCount}</span>{' '}
                subscribers in <span className="font-bold">{selectedGroup.title}</span>.
              </>
            ) : (
              'Choose a group above first.'
            )}{' '}
            There is no undo.
          </p>

          <label htmlFor="confirm" className={labelClass + ' mt-4'}>
            Type {CONFIRM_WORD} to confirm
          </label>
          <input
            id="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={inputClass + ' bg-white'}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder={CONFIRM_WORD}
          />

          <button
            type="button"
            onClick={() => run('send')}
            disabled={!canSend || busy !== ''}
            className="btn-primary mt-4 w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy === 'send'
              ? 'Sending…'
              : sent
                ? 'Sent'
                : `Send to ${selectedGroup?.recipientCount ?? 0} subscribers`}
          </button>
          {sendBlocker && (
            <p className="mt-2 text-center font-body text-xs text-ash">{sendBlocker}</p>
          )}
          <Notice result={sendResult} />
        </div>
      </section>

      <form action={signOut}>
        <button type="submit" className="font-body text-sm text-ash underline underline-offset-2">
          Sign out
        </button>
      </form>
    </div>
  );
}
