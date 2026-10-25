import type { Metadata } from 'next';
import { BENEFICIARY_FIRST_NAME } from '@/config/site';
import { athleteCountOf, eachEventCustomer, getStripe, isRegistered } from '@/lib/stripeRegistration';
import { isRaceKey, RACES } from '@/lib/races';
import { PaneHeader } from '../PaneHeader';
import { NotesBook, type BookNote } from './NotesBook';

export const metadata: Metadata = { title: `Notes for ${BENEFICIARY_FIRST_NAME}` };

/**
 * Every note written for the beneficiary on a completed registration, in the
 * order they came in. Paid registrations get theirs from the webhook, covered
 * ones when they're claimed — an abandoned checkout's note never arrives here.
 */
async function loadNotes(): Promise<BookNote[] | { error: string }> {
  const stripe = getStripe();
  if (!stripe) return { error: 'Stripe is not configured.' };

  const notes: BookNote[] = [];
  try {
    await eachEventCustomer(stripe, (customer) => {
      const text = customer.metadata?.beneficiaryNote?.trim();
      if (!text || !isRegistered(customer)) return;
      const raceType = customer.metadata.raceType;
      notes.push({
        id: customer.id,
        text,
        from: customer.name ?? '(no name)',
        email: customer.email ?? '',
        race: isRaceKey(raceType) ? RACES[raceType].short : '',
        athletes: athleteCountOf(customer),
        at: customer.metadata.registeredAt ?? '',
      });
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Could not load the notes.' };
  }

  // Oldest first — the book reads in the order the notes were written.
  return notes.sort((a, b) => a.at.localeCompare(b.at));
}

export default async function NotesPage() {
  const notes = await loadNotes();

  return (
    <>
      <div className="print:hidden">
        <PaneHeader title={`Notes for ${BENEFICIARY_FIRST_NAME}`} />
      </div>
      <div className="mx-auto max-w-5xl px-6 py-10 print:max-w-none print:p-0">
        {'error' in notes ? (
          <p className="rounded-card border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
            {notes.error}
          </p>
        ) : (
          <NotesBook notes={notes} />
        )}
      </div>
    </>
  );
}
