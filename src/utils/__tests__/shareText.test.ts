import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateShareText, shareGameResult } from '../shareText';
import { GuessEvaluation } from '../../types/game';
import { ScoreBreakdown } from '../gameLogic';

describe('shareText utility', () => {
  const mockGuesses: GuessEvaluation[] = [
    {
      guessValue: 40000,
      direction: 'higher',
      heatBand: 'warm',
      errorPercentage: 0.109,
      absoluteDifference: 4900,
      isWin: false,
    },
    {
      guessValue: 44900,
      direction: 'exact',
      heatBand: 'exact',
      errorPercentage: 0,
      absoluteDifference: 0,
      isWin: true,
      tier: 'exact',
    },
  ];

  const mockScoreBreakdown: ScoreBreakdown = {
    baseScore: 4000,
    bonusScore: 1000,
    totalScore: 5000,
    bestGuess: mockGuesses[1],
  };

  it('gera texto formatado com título, pontuação, linhas de emoji e link', () => {
    const text = generateShareText(
      mockGuesses,
      mockScoreBreakdown,
      'Gol GTS 1988',
      5,
      4
    );

    expect(text).toContain('Tá pro Brick #4');
    expect(text).toContain('Gol GTS 1988');
    expect(text).toContain('Acertei em 2/5 tentativas!');
    expect(text).toContain('5.000 pts');
    expect(text).toContain('🟡 ▲');
    expect(text).toContain('🏆 🎯');
    expect(text).toContain('taprobrick.com.br');
  });

  describe('shareGameResult', () => {
    let originalNavigator: any;

    beforeEach(() => {
      originalNavigator = global.navigator;
    });

    afterEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
      vi.restoreAllMocks();
    });

    it('utiliza navigator.share quando disponível no dispositivo (mobile)', async () => {
      const shareSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(global, 'navigator', {
        value: {
          share: shareSpy,
          canShare: vi.fn().mockReturnValue(true),
        },
        writable: true,
        configurable: true,
      });

      const outcome = await shareGameResult({
        text: 'Teste de resultado',
        title: 'Tá pro Brick',
      });

      expect(outcome).toBe('shared');
      expect(shareSpy).toHaveBeenCalledWith({
        title: 'Tá pro Brick',
        text: 'Teste de resultado',
      });
    });

    it('retorna dismissed quando usuário cancela o menu de compartilhamento nativo', async () => {
      const abortError = new Error('Share canceled');
      abortError.name = 'AbortError';
      const shareSpy = vi.fn().mockRejectedValue(abortError);

      Object.defineProperty(global, 'navigator', {
        value: {
          share: shareSpy,
          canShare: vi.fn().mockReturnValue(true),
        },
        writable: true,
        configurable: true,
      });

      const outcome = await shareGameResult({
        text: 'Teste cancelado',
      });

      expect(outcome).toBe('dismissed');
    });

    it('utiliza fallback de clipboard quando navigator.share não está disponível', async () => {
      const writeTextSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: {
            writeText: writeTextSpy,
          },
        },
        writable: true,
        configurable: true,
      });

      const outcome = await shareGameResult({
        text: 'Texto para cópia',
      });

      expect(outcome).toBe('copied');
      expect(writeTextSpy).toHaveBeenCalledWith('Texto para cópia');
    });
  });
});
