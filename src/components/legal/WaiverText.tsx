import {
  WAIVER_ACKNOWLEDGMENT,
  WAIVER_ACKNOWLEDGMENT_HEADING,
  WAIVER_EFFECTIVE_DATE,
  WAIVER_PREAMBLE,
  WAIVER_EVENT_LOCATION,
  WAIVER_SECTIONS,
  WAIVER_VERSION,
  type WaiverClause,
} from '@/data/waiver';
import { EVENT_DATE_DISPLAY } from '@/config/site';

/**
 * The full Participant Agreement, rendered from the single copy in
 * src/data/waiver.ts.
 *
 * `compact` is the scroll box inside the register flow — small type, tight
 * spacing, sized to sit under the donation fields. `page` is the standalone
 * /waiver route, set at reading size. No hooks, so it renders happily inside
 * either the client register flow or a server page.
 */
export function WaiverText({ variant = 'page' }: { variant?: 'compact' | 'page' }) {
  const compact = variant === 'compact';

  const body = compact ? 'font-body text-xs leading-relaxed text-ash' : 'font-body text-sm leading-relaxed text-ash';
  const heading = compact
    ? 'font-body text-xs font-bold uppercase tracking-widest text-ink'
    : 'font-display text-xl uppercase text-ink';
  const gap = compact ? 'space-y-4' : 'space-y-8';

  return (
    <div className={gap}>
      <div className={body}>
        <p className="font-bold uppercase text-ink">{WAIVER_PREAMBLE}</p>
        {/* The /waiver page prints this in its header, so only the checkout
            box, which has no header of its own, repeats it here. */}
        {compact && (
          <p className="mt-2">
            Version {WAIVER_VERSION} · Effective {WAIVER_EFFECTIVE_DATE} · Event{' '}
            {EVENT_DATE_DISPLAY}, {WAIVER_EVENT_LOCATION}
          </p>
        )}
      </div>

      {WAIVER_SECTIONS.map((section) => (
        <section key={section.number}>
          <h3 className={`${heading} mb-2`}>
            {section.number}. {section.heading}
          </h3>
          <div className={compact ? 'space-y-2' : 'space-y-3'}>
            {section.clauses.map((clause) => (
              <Clause key={clause.id} clause={clause} body={body} compact={compact} />
            ))}
          </div>
        </section>
      ))}

      {/* The closing section carries no numbered clauses, so it is not in
          WAIVER_SECTIONS — but it still numbers on from the last one. */}
      <section>
        <h3 className={`${heading} mb-2`}>
          {WAIVER_SECTIONS.length + 1}. {WAIVER_ACKNOWLEDGMENT_HEADING}
        </h3>
        <p className={`${body} font-bold uppercase text-ink`}>{WAIVER_ACKNOWLEDGMENT}</p>
      </section>
    </div>
  );
}

function Clause({
  clause,
  body,
  compact,
}: {
  clause: WaiverClause;
  body: string;
  compact: boolean;
}) {
  return (
    <div className={body}>
      <p>
        <span className="font-bold text-ink">{clause.id}</span>{' '}
        {clause.lead && <strong className="text-ink">{clause.lead} </strong>}
        {clause.text}
      </p>
      {clause.items && (
        <ul className={compact ? 'mt-1 space-y-1 pl-4' : 'mt-2 space-y-1.5 pl-5'}>
          {clause.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 h-px w-2 shrink-0 bg-pink" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {clause.trailing && <p className={compact ? 'mt-2' : 'mt-3'}>{clause.trailing}</p>}
    </div>
  );
}
