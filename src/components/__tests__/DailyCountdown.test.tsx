import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DailyCountdown } from '../DailyCountdown';

describe('DailyCountdown Component', () => {
  const mockScore = {
    baseScore: 4000,
    bonusScore: 1000,
    totalScore: 5000,
    bestGuess: {
      guessValue: 44900,
      direction: 'exact' as const,
      heatBand: 'exact' as const,
      errorPercentage: 0,
      absoluteDifference: 0,
      isWin: true,
      tier: 'exact' as const,
    },
  };

  it('renderiza o cabeçalho de vitória, métricas compactas e link para anúncio original', () => {
    const html = renderToString(
      React.createElement(DailyCountdown, {
        dayNumber: 5,
        scoreBreakdown: mockScore,
        askingPrice: 44900,
        originalUrl: 'https://olx.com.br/anuncio-teste',
        attemptsUsed: 2,
        maxAttempts: 5,
      })
    );

    expect(html).toContain('Desafio Diário');
    expect(html).toContain('Concluído');
    expect(html).toContain('Você Acertou o Preço! 🎯');
    expect(html).toContain('Preço Real');
    expect(html).toContain('Seu Melhor Chute');
    expect(html).toContain('44.900');
    expect(html).toContain('5.000');
    expect(html).toContain('pts');
    expect(html).toContain('chutes');
    expect(html).toContain('Ver Anúncio Original no Marketplace');
    expect(html).toContain('Próximo anúncio em:');
  });

  it('renderiza cabeçalho de fim de jogo quando jogador não venceu', () => {
    const mockLostScore = {
      baseScore: 0,
      bonusScore: 0,
      totalScore: 500,
      bestGuess: {
        guessValue: 60000,
        direction: 'lower' as const,
        heatBand: 'freezing' as const,
        errorPercentage: 0.336,
        absoluteDifference: 15100,
        isWin: false,
      },
    };

    const html = renderToString(
      React.createElement(DailyCountdown, {
        dayNumber: 5,
        scoreBreakdown: mockLostScore,
        askingPrice: 44900,
        attemptsUsed: 5,
        maxAttempts: 5,
      })
    );

    expect(html).toContain('Fim de Jogo! 🏁');
    expect(html).toContain('60.000');
    expect(html).toContain('500');
    expect(html).toContain('pts');
  });
});
