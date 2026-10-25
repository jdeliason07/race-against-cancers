'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { handwriting } from '@/lib/fonts';
import type { BrooksPhoto } from '@/data/brooks';

const ADVANCE_MS = 4500;

// Reads prefers-reduced-motion. The server has no media queries, so it
// assumes reduced — the slideshow then starts after hydration, never before.
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
const reducedMotionNow = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reducedMotionOnServer = () => true;

interface PhotoCarouselProps {
  photos: BrooksPhoto[];
  /** Names the carousel for screen readers, e.g. "Photos of Brooks". */
  label: string;
  className?: string;
}

/**
 * A swipeable strip of polaroids. The photo in the middle sits straight and
 * full size; the ones either side tilt and shrink back. Swipe, use the arrow
 * buttons or keys, or tap a side photo to bring it forward.
 *
 * It advances on its own every few seconds, except when the visitor prefers
 * reduced motion, is hovering over or focused on the photos, has scrolled it
 * out of view, or has paused it — and it stops for good once they take the
 * controls.
 */
export function PhotoCarousel({ photos, label, className }: PhotoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frame = useRef(0);
  // Where a button or key last sent the strip. Until it gets there, the next
  // press counts on from here, so pressing Next twice quickly moves two.
  const target = useRef<number | null>(null);
  // The same index as `active`, but readable before React re-renders — a key
  // can land between a scroll and the render that follows it.
  const current = useRef(0);

  const [active, setActive] = useState(0);
  // null until the visitor presses play or pause; until then it follows
  // their motion preference.
  const [playChoice, setPlayChoice] = useState<boolean | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [inView, setInView] = useState(false);

  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, reducedMotionNow, reducedMotionOnServer);
  const playing = playChoice ?? !reducedMotion;
  const count = photos.length;

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const i = (index + count) % count;
      const slide = slideRefs.current[i];
      if (!track || !slide) return;
      target.current = i;
      track.scrollTo({
        left: slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    },
    [count, reducedMotion],
  );

  // Whichever slide is nearest the middle is the active one — however it got
  // there: a swipe, a button, a key, or the timer.
  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const middle = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - middle);
        if (distance < best) {
          best = distance;
          nearest = i;
        }
      });
      current.current = nearest;
      setActive(nearest);
      if (nearest === target.current) target.current = null;
    });
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || engaged || !inView) return;
    const id = setTimeout(() => goTo(active + 1), ADVANCE_MS);
    return () => clearTimeout(id);
  }, [playing, engaged, inView, active, goTo]);

  // Taking the controls means they want to look at their own pace.
  const step = (delta: number) => {
    setPlayChoice(false);
    goTo((target.current ?? current.current) + delta);
  };
  // A swipe or a scroll wheel overrides wherever a button was heading.
  const letGo = () => { target.current = null; };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowLeft: () => step(-1),
      ArrowRight: () => step(1),
      Home: () => { setPlayChoice(false); goTo(0); },
      End: () => { setPlayChoice(false); goTo(count - 1); },
    };
    const action = keys[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const controlClass =
    'flex h-12 w-12 items-center justify-center rounded-full border-2 border-pink text-pink transition-colors hover:bg-pink hover:text-white';

  return (
    <div className={className} role="region" aria-roledescription="carousel" aria-label={label}>
      {/* Hovering or focusing the photos holds the slideshow; the controls
          below don't, so pressing play starts it straight away. */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        onPointerDown={letGo}
        onWheel={letGo}
        onPointerEnter={() => setEngaged(true)}
        onPointerLeave={() => setEngaged(false)}
        onFocus={() => setEngaged(true)}
        onBlur={() => setEngaged(false)}
        tabIndex={0}
        aria-label={`${label} — use the arrow keys to move between photos`}
        className="photo-carousel no-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[calc(50vw-120px)] py-10 sm:gap-6 sm:px-[calc(50vw-140px)]"
      >
        {photos.map((photo, i) => {
          const isActive = i === active;
          return (
            <div
              key={photo.src.src}
              ref={(el) => { slideRefs.current[i] = el; }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              className="w-[240px] shrink-0 snap-center sm:w-[280px]"
            >
              <figure
                onClick={() => { if (!isActive) goTo(i); }}
                className={cn(
                  // A strip of tape holds each one up.
                  'relative rounded-[6px] bg-white p-3 pb-4 shadow-[0_14px_34px_-14px_rgba(28,23,25,0.45)] transition-[transform,opacity] duration-500 ease-out',
                  'before:absolute before:-top-3 before:left-1/2 before:z-10 before:h-6 before:w-20 before:-translate-x-1/2 before:-rotate-3 before:bg-petal/70',
                  isActive
                    ? 'rotate-0 scale-100 opacity-100'
                    : cn('scale-[0.86] cursor-pointer opacity-60', i % 2 ? 'rotate-3' : '-rotate-3'),
                )}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-blush">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 640px) 280px, 240px"
                    placeholder="blur"
                    className="object-cover"
                    style={photo.focus ? { objectPosition: photo.focus } : undefined}
                  />
                </div>
                <figcaption className={cn(handwriting.className, 'mt-3 text-center text-2xl leading-tight text-ink')}>
                  {photo.caption}
                </figcaption>
              </figure>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 px-6">
        <button type="button" onClick={() => step(-1)} className={controlClass} aria-label="Previous photo">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <p
          className="min-w-[5.5rem] text-center font-display text-2xl tabular-nums text-ink"
          aria-live={playing && !engaged ? 'off' : 'polite'}
          aria-atomic="true"
        >
          <span className="sr-only">Photo </span>
          {pad(active + 1)} <span className="text-petal" aria-hidden="true">/</span>
          <span className="sr-only"> of </span> {pad(count)}
        </p>
        <button type="button" onClick={() => step(1)} className={controlClass} aria-label="Next photo">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setPlayChoice(!playing)}
          className="flex h-12 w-12 items-center justify-center rounded-full text-ash transition-colors hover:text-pink"
          aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
        >
          {playing ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
        </button>
      </div>

      {/* How far through the photos you are. */}
      <div className="mx-auto mt-4 h-1.5 w-full max-w-[240px] overflow-hidden rounded-pill bg-petal" aria-hidden="true">
        <div
          className="h-full rounded-pill bg-pink transition-[width] duration-500"
          style={{ width: `${((active + 1) / count) * 100}%` }}
        />
      </div>
    </div>
  );
}
