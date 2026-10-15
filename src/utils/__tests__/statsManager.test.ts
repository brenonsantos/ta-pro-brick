import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateNextStats,
  createInitialStats,
  PlayerStats,
} from '../statsManager';

describe('statsManager', () => {
  let initialStats: PlayerStats;

  beforeEach(() => {
    initialStats = createInitialStats();
  });

  it('initializes with default zeroed stats', () => {
    expect(initialStats.gamesPlayed).toBe(0);
    expect(initialStats.gamesWon).toBe(0);
    expect(initialStats.currentStreak).toBe(0);
    expect(initialStats.maxStreak).toBe(0);
    expect(initialStats.guessDistribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    expect(initialStats.completedChallengeIds).toEqual([]);
    expect(initialStats.lastPlayedDate).toBeUndefined();
  });

  it('records a win on the first attempt correctly', () => {
    const updated = calculateNextStats(initialStats, {
      challengeId: 'car-1',
      isWin: true,
      attemptsUsed: 1,
      dateString: '2026-10-15',
    });

    expect(updated.gamesPlayed).toBe(1);
    expect(updated.gamesWon).toBe(1);
    expect(updated.currentStreak).toBe(1);
    expect(updated.maxStreak).toBe(1);
    expect(updated.guessDistribution[1]).toBe(1);
    expect(updated.guessDistribution[2]).toBe(0);
    expect(updated.completedChallengeIds).toContain('car-1');
    expect(updated.lastPlayedDate).toBe('2026-10-15');
  });

  it('increments streak when playing on consecutive days', () => {
    const day1Stats = calculateNextStats(initialStats, {
      challengeId: 'car-1',
      isWin: true,
      attemptsUsed: 3,
      dateString: '2026-10-15',
    });

    const day2Stats = calculateNextStats(day1Stats, {
      challengeId: 'car-2',
      isWin: true,
      attemptsUsed: 2,
      dateString: '2026-10-16',
    });

    expect(day2Stats.gamesPlayed).toBe(2);
    expect(day2Stats.gamesWon).toBe(2);
    expect(day2Stats.currentStreak).toBe(2);
    expect(day2Stats.maxStreak).toBe(2);
    expect(day2Stats.guessDistribution[3]).toBe(1);
    expect(day2Stats.guessDistribution[2]).toBe(1);
  });

  it('resets streak to 1 on win if user missed a day', () => {
    const day1Stats = calculateNextStats(initialStats, {
      challengeId: 'car-1',
      isWin: true,
      attemptsUsed: 2,
      dateString: '2026-10-10',
    });

    const day3Stats = calculateNextStats(day1Stats, {
      challengeId: 'car-2',
      isWin: true,
      attemptsUsed: 4,
      dateString: '2026-10-15', // 5 days later
    });

    expect(day3Stats.currentStreak).toBe(1);
    expect(day3Stats.maxStreak).toBe(1);
  });

  it('resets current streak to 0 on loss, but preserves maxStreak', () => {
    const winningStats: PlayerStats = {
      ...initialStats,
      gamesPlayed: 5,
      gamesWon: 5,
      currentStreak: 5,
      maxStreak: 5,
      lastPlayedDate: '2026-10-14',
    };

    const lossStats = calculateNextStats(winningStats, {
      challengeId: 'car-3',
      isWin: false,
      attemptsUsed: 5,
      dateString: '2026-10-15',
    });

    expect(lossStats.gamesPlayed).toBe(6);
    expect(lossStats.gamesWon).toBe(5);
    expect(lossStats.currentStreak).toBe(0);
    expect(lossStats.maxStreak).toBe(5);
    expect(lossStats.lastPlayedDate).toBe('2026-10-15');
  });

  it('does not double count already completed challenges', () => {
    const day1Stats = calculateNextStats(initialStats, {
      challengeId: 'car-1',
      isWin: true,
      attemptsUsed: 2,
      dateString: '2026-10-15',
    });

    const repeatedStats = calculateNextStats(day1Stats, {
      challengeId: 'car-1',
      isWin: true,
      attemptsUsed: 1,
      dateString: '2026-10-15',
    });

    expect(repeatedStats).toEqual(day1Stats);
  });
});
