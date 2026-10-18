import { describe, it, expect } from 'vitest';
import {
  getDaysSinceEpoch,
  getDailyChallengeNumber,
  getDailyChallengeIndex,
  getTimeUntilMidnight,
  getCurrentWeekRange,
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

  describe('getCurrentWeekRange (Ciclo Semanal com reset no domingo às 00:00)', () => {
    it('inicia no domingo 00:00 e zera no próximo domingo 00:00 para um domingo', () => {
      // 2026-10-18 é um Domingo
      const sundayRef = new Date(2026, 9, 18, 10, 30, 0); // 18 de Outubro de 2026
      const range = getCurrentWeekRange(sundayRef);

      expect(range.startOfWeek.getDate()).toBe(18);
      expect(range.startOfWeek.getHours()).toBe(0);
      expect(range.startOfWeek.getMinutes()).toBe(0);

      expect(range.endOfWeek.getDate()).toBe(25);
      expect(range.endOfWeek.getHours()).toBe(0);
      expect(range.daysRemaining).toBe(6);
      expect(range.timeRemainingText).toContain('domingo 00h');
    });

    it('calcula o domingo anterior correto para uma quarta-feira e um sábado', () => {
      // 2026-10-21 é Quarta-feira
      const wednesdayRef = new Date(2026, 9, 21, 14, 0, 0);
      const wedRange = getCurrentWeekRange(wednesdayRef);
      expect(wedRange.startOfWeek.getDate()).toBe(18); // Domingo anterior
      expect(wedRange.endOfWeek.getDate()).toBe(25); // Próximo domingo
      expect(wedRange.daysRemaining).toBe(3);

      // 2026-10-24 é Sábado (último dia da semana antes do reset de domingo 00h)
      const saturdayRef = new Date(2026, 9, 24, 20, 0, 0);
      const satRange = getCurrentWeekRange(saturdayRef);
      expect(satRange.startOfWeek.getDate()).toBe(18);
      expect(satRange.endOfWeek.getDate()).toBe(25);
      expect(satRange.daysRemaining).toBe(0);
      expect(satRange.hoursRemaining).toBe(4);
      expect(satRange.timeRemainingText).toContain('4h (domingo 00h)');
    });
  });
});
