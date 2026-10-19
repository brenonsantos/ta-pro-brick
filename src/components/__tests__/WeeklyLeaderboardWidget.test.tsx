import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { WeeklyLeaderboardWidget } from '../WeeklyLeaderboardWidget';

describe('WeeklyLeaderboardWidget Component', () => {
  it('renderiza o seletor de abas com Ranking de Hoje e Ranking Semanal', () => {
    const onOpen = vi.fn();
    const html = renderToString(
      React.createElement(WeeklyLeaderboardWidget, {
        onOpenLeaderboard: onOpen,
        dayNumber: 4,
        challengeId: 'challenge-004',
      })
    );

    expect(html).toContain('Ranking de Hoje');
    expect(html).toContain('#4');
    expect(html).toContain('Ranking Semanal');
    expect(html).toContain('Ao Vivo');
    expect(html).toContain('Ver tabela completa');
    expect(html).toContain('Ver Classificação Diária Completa');
  });

  it('renderiza o modo semanal quando initialTab é weekly', () => {
    const onOpen = vi.fn();
    const html = renderToString(
      React.createElement(WeeklyLeaderboardWidget, {
        onOpenLeaderboard: onOpen,
        initialTab: 'weekly',
      })
    );

    expect(html).toContain('Ranking Semanal');
    expect(html).toContain('domingo 00h');
    expect(html).toContain('Ver Ranking Semanal Completo');
  });

  it('permite passar className adicional para estilização customizada', () => {
    const onOpen = vi.fn();
    const html = renderToString(
      React.createElement(WeeklyLeaderboardWidget, {
        onOpenLeaderboard: onOpen,
        className: 'custom-widget-class',
      })
    );

    expect(html).toContain('custom-widget-class');
  });

  it('renderiza o subtítulo padrão para a aba diária quando ainda não há dados', () => {
    const onOpen = vi.fn();
    const html = renderToString(
      React.createElement(WeeklyLeaderboardWidget, {
        onOpenLeaderboard: onOpen,
        dayNumber: 5,
        initialTab: 'daily',
      })
    );

    expect(html).toContain('Classificação dos pilotos no desafio de hoje');
  });
});
