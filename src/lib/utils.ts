import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Age of majority — under this on race day, a parent or legal guardian has to
 * accept the waiver on the athlete's behalf (Participant Agreement, Section 10).
 *
 * Registration asks whether the athlete will be this old on race day rather
 * than for a date of birth, so the date helpers that used to live here are
 * gone. Exact dates are collected at check-in; anything that needs to compute
 * an age from one belongs with that tooling.
 */
export const ADULT_AGE = 18;
