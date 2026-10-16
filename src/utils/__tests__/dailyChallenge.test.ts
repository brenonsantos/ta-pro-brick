import { describe, it, expect } from 'vitest';
import {
  getDaysSinceEpoch,
  getDailyChallengeNumber,
  getDailyChallengeIndex,
  getTimeUntilMidnight,
  EPOCH_DATE_STRING,
} from '../dailyChallenge';

describe('dailyChallenge utility', () => {
  it('calculates days since epoch correctly', () => {
    expect(getDaysSinceEpoch(EPOCH_DATE_STRING)).toBe(0);
    expect(getDaysSinceEpoch('2026-10-16')).toBe(1);
    expect(getDaysSinceEpoch('2026-10-20')).toBe(5);
  });

  it('calculates daily challenge sequence number', () => {
    expect(getDailyChallengeNumber(EPOCH_DATE_STRING)).toBe(1);
    expect(getDailyChallengeNumber('2026-10-16')).toBe(2);
    expect(getDailyChallengeNumber('2026-10-17')).toBe(3);
  });

  it('cycles deterministically through available challenges', () => {
    const total = 5;
    expect(getDailyChallengeIndex(total, '2026-10-15')).toBe(0);
    expect(getDailyChallengeIndex(total, '2026-10-16')).toBe(1);
    expect(getDailyChallengeIndex(total, '2026-10-17')).toBe(2);
    expect(getDailyChallengeIndex(total, '2026-10-18')).toBe(3);
    expect(getDailyChallengeIndex(total, '2026-10-19')).toBe(4);
    expect(getDailyChallengeIndex(total, '2026-10-20')).toBe(0); // Rotates back to first challenge
  });

  it('formats time until midnight correctly', () => {
    const time = getTimeUntilMidnight();
    expect(time).toHaveProperty('hours');
    expect(time).toHaveProperty('minutes');
    expect(time).toHaveProperty('seconds');
    expect(time.formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});
