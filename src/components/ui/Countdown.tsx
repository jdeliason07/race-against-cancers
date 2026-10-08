'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  /** ISO timestamp to count down to. */
  target: string;
  className?: string;
}

function remaining(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    done: diff === 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/**
 * Live countdown to race start. Renders dashes on the server and fills in
 * after mount, so the server HTML and the first client render always match.
 */
export function Countdown({ target, className }: CountdownProps) {
  const targetMs = new Date(target).getTime();
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    const tick = () => setTime(remaining(targetMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (time?.done) {
    return (
      <p className={cn('font-display text-4xl uppercase text-pink', className)}>
        It&rsquo;s race day
      </p>
    );
  }

  const units: [string, number | undefined][] = [
    ['Days', time?.days],
    ['Hrs', time?.hours],
    ['Min', time?.minutes],
    ['Sec', time?.seconds],
  ];

  return (
    <div className={cn('grid grid-cols-4 gap-2', className)} role="timer" aria-live="off">
      {units.map(([label, value]) => (
        <div key={label} className="rounded-card border border-petal bg-paper px-2 py-4 text-center">
          <span className="block font-display text-[clamp(32px,6vw,56px)] leading-none text-ink tabular-nums">
            {value === undefined ? '–' : String(value).padStart(2, '0')}
          </span>
          <span className="mt-2 block font-body text-[11px] font-bold uppercase tracking-widest text-ash">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
