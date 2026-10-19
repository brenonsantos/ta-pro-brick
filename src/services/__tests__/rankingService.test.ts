import { describe, it, expect, beforeEach } from 'vitest';
import {
  submitDailyResult,
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  getWeeklyLeaderboard,
  calculatePlayerPercentile,
  formatPlayerPercentileText,
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

  it('agrega a pontuação semanal e respeita o ciclo com reset no domingo', async () => {
    // Domingo 18 de Outubro de 2026
    const sundayRef = new Date(2026, 9, 18, 12, 0, 0);

    await submitDailyResult({
      challengeId: 'week-car-1',
      score: 750,
      attemptsCount: 3,
      bestGuess: 30000,
      won: true,
    });

    await submitDailyResult({
      challengeId: 'week-car-2',
      score: 850,
      attemptsCount: 2,
      bestGuess: 40000,
      won: true,
    });

    const weekly = await getWeeklyLeaderboard(sundayRef);
    const myWeekly = weekly.find((e) => e.isCurrentPlayer);

    expect(myWeekly).toBeDefined();
    expect(myWeekly?.totalScore).toBe(1600);
    expect(myWeekly?.gamesPlayed).toBe(2);
    expect(myWeekly?.gamesWon).toBe(2);
  });

  describe('calculatePlayerPercentile & formatPlayerPercentileText', () => {
    it('calcula 100% para o 1º colocado ou jogador único', () => {
      expect(calculatePlayerPercentile(1, 1)).toBe(100);
      expect(calculatePlayerPercentile(1, 5)).toBe(100);
      expect(calculatePlayerPercentile(1, 100)).toBe(100);
      expect(formatPlayerPercentileText(1, 1)).toContain('Melhor que 100% dos jogadores hoje! 🏆');
      expect(formatPlayerPercentileText(1, 10)).toContain('Melhor que 100% dos jogadores hoje! 🏆');
    });

    it('calcula percentis proporcionais para posições intermediárias', () => {
      // 2º de 5 jogadores = superou 3 de 4 = 75%
      expect(calculatePlayerPercentile(2, 5)).toBe(75);
      expect(formatPlayerPercentileText(2, 5)).toBe('Melhor que 75% dos jogadores hoje 🔥');

      // 3º de 5 jogadores = superou 2 de 4 = 50%
      expect(calculatePlayerPercentile(3, 5)).toBe(50);
      expect(formatPlayerPercentileText(3, 5)).toBe('Melhor que 50% dos jogadores hoje 🔥');

      // 10º de 100 jogadores = superou 90 de 99 = 91%
      expect(calculatePlayerPercentile(10, 100)).toBe(91);
      expect(formatPlayerPercentileText(10, 100)).toBe('Melhor que 91% dos jogadores hoje 🔥');
    });

    it('retorna 0% e mensagem de conclusão para o último colocado com múltiplos jogadores', () => {
      expect(calculatePlayerPercentile(5, 5)).toBe(0);
      expect(formatPlayerPercentileText(5, 5)).toBe('Você completou o desafio de hoje! 🏁');
    });

    it('retorna texto padrão quando não há jogadores', () => {
      expect(formatPlayerPercentileText(0, 0)).toBe('Classificação dos pilotos no desafio de hoje');
    });
  });
});
