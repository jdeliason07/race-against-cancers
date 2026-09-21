import type { Series, SeriesUnit } from '@/lib/adminStats';

// Single series, single hue. #F0307A is the site accent and validates clean
// against a white surface (lightness band, chroma floor, and 3:1 contrast), so
// there is no second colour to separate under colour-vision deficiency — the
// most recent bucket is marked by a label rather than a hue change.
const ACCENT = '#F0307A';
const BASELINE = '#ECE2E6';

const WIDTH = 240;
const HEIGHT = 40;
const RADIUS = 2;

/** Surface gap between bars, dropped to a hairline once the chart is busy. */
function gapFor(count: number): number {
  return count > 40 ? 1 : 2;
}

const PER_UNIT: Record<SeriesUnit, string> = {
  day: 'per day',
  week: 'per week',
  month: 'per month',
};

/** The bucket in progress, named the way someone would say it out loud. */
const CURRENT_UNIT: Record<SeriesUnit, string> = {
  day: 'today',
  week: 'this week',
  month: 'this month',
};

function bucketLabel(startMs: number, unit: SeriesUnit): string {
  const d = new Date(startMs);
  if (unit === 'month') return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return unit === 'week' ? `Week of ${day}` : day;
}

/**
 * All of it, from the first signup to today — not a rolling window.
 *
 * The bucket size comes from the data (see Series): the bars stay the same
 * width on screen and cover more time as the event gets older, which is the
 * only way a fixed-width chart can show a growing history honestly.
 */
export function Sparkline({
  series,
  format = (n: number) => n.toLocaleString(),
  label,
}: {
  series: Series;
  format?: (n: number) => string;
  /** The thing being counted, e.g. "registrations". Used in the caption. */
  label: string;
}) {
  const { values, startsMs, unit } = series;
  const count = Math.max(values.length, 1);
  const max = Math.max(...values, 1);
  const gap = gapFor(count);
  const barWidth = Math.max(0.5, (WIDTH - gap * (count - 1)) / count);
  const latest = values[values.length - 1] ?? 0;
  const hasAny = values.some((v) => v > 0);
  const caption = `All time, ${label} ${PER_UNIT[unit]}`;

  return (
    <figure className="mt-3 m-0">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height={HEIGHT}
        role="img"
        aria-label={`${caption}. ${format(latest)} so far ${CURRENT_UNIT[unit]}.`}
        preserveAspectRatio="none"
      >
        {/* Baseline, so an all-zero stretch still reads as "zero" not "missing" */}
        <line x1="0" y1={HEIGHT - 0.5} x2={WIDTH} y2={HEIGHT - 0.5} stroke={BASELINE} strokeWidth="1" />
        {values.map((value, i) => {
          const h = value === 0 ? 0 : Math.max(2, (value / max) * (HEIGHT - 3));
          const x = i * (barWidth + gap);
          // The last bucket is the one we are living in, so its bar is short
          // by definition. Saying "so far" stops that reading as a collapse.
          const isCurrent = i === values.length - 1;
          const heading = bucketLabel(startsMs[i] ?? 0, unit);
          return (
            <rect
              key={startsMs[i] ?? i}
              x={x}
              y={HEIGHT - h}
              width={barWidth}
              height={h}
              rx={Math.min(RADIUS, barWidth / 2)}
              fill={ACCENT}
            >
              <title>{`${heading}: ${format(value)}${isCurrent ? ' so far' : ''}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-1 font-body text-[11px] text-ash">
        {hasAny ? `${caption} · ${format(latest)} ${CURRENT_UNIT[unit]}` : caption}
      </figcaption>
    </figure>
  );
}
