import { GameState } from '../types/game';

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate?: string; // Format: 'YYYY-MM-DD'
  guessDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  completedChallengeIds: string[];
}

export const STATS_STORAGE_KEY = 'taprobrick_player_stats_v1';
export const GAME_STATES_STORAGE_KEY = 'taprobrick_game_states_v1';

export function createInitialStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
    completedChallengeIds: [],
  };
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isYesterday(prevDateStr: string, currentDateStr: string): boolean {
  try {
    const [pYear, pMonth, pDay] = prevDateStr.split('-').map(Number);
    const [cYear, cMonth, cDay] = currentDateStr.split('-').map(Number);

    const prevDate = new Date(pYear, pMonth - 1, pDay);
    const currDate = new Date(cYear, cMonth - 1, cDay);

    const diffMs = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return diffDays === 1;
  } catch {
    return false;
  }
}

export interface RecordGameInput {
  challengeId: string;
  isWin: boolean;
  attemptsUsed: number;
  dateString?: string;
}

export function calculateNextStats(
  prevStats: PlayerStats,
  input: RecordGameInput
): PlayerStats {
  // Prevent duplicate scoring of the same challenge
  if (prevStats.completedChallengeIds.includes(input.challengeId)) {
    return prevStats;
  }

  const today = input.dateString || getTodayDateString();
  const gamesPlayed = prevStats.gamesPlayed + 1;
  const gamesWon = input.isWin ? prevStats.gamesWon + 1 : prevStats.gamesWon;

  let currentStreak = prevStats.currentStreak;
  if (input.isWin) {
    if (!prevStats.lastPlayedDate) {
      currentStreak = 1;
    } else if (prevStats.lastPlayedDate === today) {
      currentStreak = Math.max(1, prevStats.currentStreak);
    } else if (isYesterday(prevStats.lastPlayedDate, today)) {
      currentStreak = prevStats.currentStreak + 1;
    } else {
      currentStreak = 1;
    }
  } else {
    currentStreak = 0;
  }

  const maxStreak = Math.max(prevStats.maxStreak, currentStreak);

  const guessDistribution = { ...prevStats.guessDistribution };
  if (input.isWin && input.attemptsUsed >= 1 && input.attemptsUsed <= 5) {
    const attemptKey = input.attemptsUsed as 1 | 2 | 3 | 4 | 5;
    guessDistribution[attemptKey] = (guessDistribution[attemptKey] || 0) + 1;
  }

  return {
    gamesPlayed,
    gamesWon,
    currentStreak,
    maxStreak,
    lastPlayedDate: today,
    guessDistribution,
    completedChallengeIds: [...prevStats.completedChallengeIds, input.challengeId],
  };
}

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return createInitialStats();
    const parsed = JSON.parse(raw);
    return {
      ...createInitialStats(),
      ...parsed,
      guessDistribution: {
        ...createInitialStats().guessDistribution,
        ...(parsed.guessDistribution || {}),
      },
      completedChallengeIds: Array.isArray(parsed.completedChallengeIds)
        ? parsed.completedChallengeIds
        : [],
    };
  } catch {
    return createInitialStats();
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

export function loadSavedGameStates(): Record<string, GameState> | null {
  try {
    const raw = localStorage.getItem(GAME_STATES_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, GameState>;
  } catch {
    return null;
  }
}

export function saveGameStates(states: Record<string, GameState>): void {
  try {
    localStorage.setItem(GAME_STATES_STORAGE_KEY, JSON.stringify(states));
  } catch {
    // Ignore storage quota errors
  }
}
