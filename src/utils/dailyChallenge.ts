import { getTodayDateString } from './statsManager';

export const EPOCH_DATE_STRING = '2026-10-15';

export function getDaysSinceEpoch(dateString?: string): number {
  const targetDateStr = dateString || getTodayDateString();
  const [tY, tM, tD] = targetDateStr.split('-').map(Number);
  const [eY, eM, eD] = EPOCH_DATE_STRING.split('-').map(Number);

  const targetDate = new Date(Date.UTC(tY, tM - 1, tD));
  const epochDate = new Date(Date.UTC(eY, eM - 1, eD));

  const diffMs = targetDate.getTime() - epochDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getDailyChallengeNumber(dateString?: string): number {
  return getDaysSinceEpoch(dateString) + 1;
}

export function getDailyChallengeIndex(totalChallenges: number, dateString?: string): number {
  if (totalChallenges <= 0) return 0;
  const days = getDaysSinceEpoch(dateString);
  return days % totalChallenges;
}

export interface MidnightCountdown {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

export function getTimeUntilMidnight(): MidnightCountdown {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { hours, minutes, seconds, formatted };
}
