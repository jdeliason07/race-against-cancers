'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { BENEFICIARY_FIRST_NAME, EVENT_DATE_DISPLAY, EVENT_NAME } from '@/config/site';
import { BROOKS_BADGE, BROOKS_TAGLINE } from '@/data/brooks';
import { handwriting } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export interface BookNote {
  /** The Stripe customer id — stable, and one note per customer. */
  id: string;
  text: string;
  /** Who wrote it, for reading through on screen. Never printed: they sign their own note. */
  from: string;
  email: string;
  /** Short race name, e.g. "5K". Printed under the note. */
  race: string;
  athletes: number;
  /** ISO time the registration completed. */
  at: string;
}

/**
 * The notes as a printable book: a cover, then every note on its own card.
 *
 * On screen each note carries a tickbox and who wrote it, so they can be read
 * before anything goes to the printer. Unticking only hides a note from the
 * print — nothing is saved or deleted — because what a five-year-old reads is
 * worth a human pass, and a typed note is otherwise printed exactly as written.
 */
export function NotesBook({ notes }: { notes: BookNote[] }) {
  const [leftOut, setLeftOut] = useState<Set<string>>(() => new Set());
  const kept = notes.length - leftOut.size;

  const toggle = (id: string) =>
    setLeftOut((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="notes-book">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-mist p-5 print:hidden">
        <div className="max-w-xl">
          <p className="font-body text-sm font-bold text-ink">
            {kept} of {notes.length} {notes.length === 1 ? 'note' : 'notes'} in the book
          </p>
          <p className="mt-1 font-body text-xs leading-relaxed text-ash">
            Read them first and untick any you&rsquo;d rather leave out — that only changes what
            prints. Then print, or choose &ldquo;Save as PDF&rdquo; and take it to a print shop.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="btn-ghost px-5 py-3">
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={kept === 0}
            className="btn-primary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Print the book
          </button>
        </div>
      </div>

      {/* The cover — its own page in print. */}
      <section className="mb-10 flex flex-col items-center rounded-card border border-line bg-white px-6 py-16 text-center print:mb-0 print:min-h-[9in] print:justify-center print:border-0 print:break-after-page">
        <Image
          src={BROOKS_BADGE}
          alt=""
          width={176}
          height={176}
          className="h-44 w-44 -rotate-6 rounded-[22px] border-4 border-white shadow-[0_14px_34px_-14px_rgba(28,23,25,0.45)]"
        />
        <p className="section-label mt-10">From the runners of {EVENT_NAME}</p>
        <h2 className="mt-4 font-display text-[clamp(56px,10vw,112px)] uppercase leading-[0.9] text-ink">
          Notes for <span className="text-pink">{BENEFICIARY_FIRST_NAME}</span>
        </h2>
        <p className="mt-4 font-display text-2xl uppercase text-pink">{BROOKS_TAGLINE}</p>
        <p className="mt-8 font-body text-sm text-ash">
          {EVENT_DATE_DISPLAY} · {kept} {kept === 1 ? 'note' : 'notes'}
        </p>
      </section>

      {notes.length === 0 ? (
        <p className="font-body text-sm text-ash print:hidden">
          No notes yet. They&rsquo;re written on the registration form, and show up here once that
          registration is paid.
        </p>
      ) : (
        <ol className="grid gap-6 md:grid-cols-2 print:grid-cols-2 print:gap-5">
          {notes.map((note) => {
            const out = leftOut.has(note.id);
            return (
              <li key={note.id} className={cn('break-inside-avoid', out && 'print:hidden')}>
                <label className="mb-2 flex cursor-pointer items-start gap-3 font-body text-xs text-ash print:hidden">
                  <input
                    type="checkbox"
                    checked={!out}
                    onChange={() => toggle(note.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-pink"
                  />
                  <span className="min-w-0">
                    <span className="font-bold text-ink">{note.from}</span> · {note.email}
                    {note.race && ` · ${note.race}`}
                    {note.athletes > 1 && ` × ${note.athletes}`}
                  </span>
                </label>
                <figure
                  className={cn(
                    'relative rounded-card border border-petal bg-white px-6 pb-5 pt-9 transition-opacity',
                    out && 'opacity-40',
                  )}
                >
                  <span aria-hidden="true" className="absolute left-5 top-1 font-display text-6xl leading-none text-petal">
                    &ldquo;
                  </span>
                  <blockquote
                    className={cn(
                      handwriting.className,
                      'whitespace-pre-line break-words text-[26px] leading-snug text-ink print:text-[21px]',
                    )}
                  >
                    {note.text}
                  </blockquote>
                  {note.race && (
                    <figcaption className="mt-4 font-body text-[11px] font-bold uppercase tracking-widest text-pink">
                      {note.race}
                    </figcaption>
                  )}
                </figure>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
