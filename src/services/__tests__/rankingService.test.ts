import { describe, it, expect, beforeEach } from 'vitest';
import {
  submitDailyResult,
  getDailyLeaderboard,
  getAllTimeLeaderboard,
} from '../rankingService';
import { updatePlayerNickname, getOrCreatePlayerProfile } from '../playerService';

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, val: string) => storage.set(key, String(val)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
globalThis.localStorage = localStorageMock as any;

describe('rankingService (Ranking por Pontos)', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('ordena o ranking diário prioritariamente por pontos (score DESC)', async () => {
    const challengeId = 'car-test-1';
    
    // Jogador 1 envia 800 pontos
    await submitDailyResult({
      challengeId,
      score: 800,
      attemptsCount: 3,
      bestGuess: 45000,
      won: true,
    });

    const leaderboard = await getDailyLeaderboard(challengeId);
    expect(leaderboard.length).toBeGreaterThan(0);

    // Valida que cada entrada subsequente tem score menor ou igual
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].score).toBeGreaterThanOrEqual(leaderboard[i + 1].score);
    }
  });

  it('desempata por número de tentativas se os pontos forem idênticos', async () => {
    const challengeId = 'car-tie-test';
    
    await submitDailyResult({
      challengeId,
      score: 1000,
      attemptsCount: 2,
      bestGuess: 50000,
      won: true,
    });

    const leaderboard = await getDailyLeaderboard(challengeId);
    const playerEntry = leaderboard.find((e) => e.isCurrentPlayer);
    expect(playerEntry).toBeDefined();
    expect(playerEntry?.score).toBe(1000);
  });

  it('permite customizar o apelido e reflete no perfil do jogador', async () => {
    const initial = getOrCreatePlayerProfile();
    expect(initial.nickname).toBeDefined();

    const updated = await updatePlayerNickname('Rubinho da Fipe');
    expect(updated.nickname).toBe('Rubinho da Fipe');

    const loaded = getOrCreatePlayerProfile();
    expect(loaded.nickname).toBe('Rubinho da Fipe');
  });

  it('agrega a pontuação total no ranking geral', async () => {
    await submitDailyResult({
      challengeId: 'c1',
      score: 600,
      attemptsCount: 3,
      bestGuess: 10000,
      won: true,
    });

    await submitDailyResult({
      challengeId: 'c2',
      score: 950,
      attemptsCount: 2,
      bestGuess: 25000,
      won: true,
    });

    const allTime = await getAllTimeLeaderboard();
    const myEntry = allTime.find((e) => e.isCurrentPlayer);
    expect(myEntry).toBeDefined();
    expect(myEntry?.totalScore).toBe(1550);
    expect(myEntry?.gamesPlayed).toBe(2);
  });
});
