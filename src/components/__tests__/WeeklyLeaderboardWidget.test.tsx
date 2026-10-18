import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { WeeklyLeaderboardWidget } from '../WeeklyLeaderboardWidget';

describe('WeeklyLeaderboardWidget Component', () => {
  it('renderiza o cabeçalho do ranking semanal e o aviso de reset aos domingos 00h', () => {
    const onOpen = vi.fn();
    const html = renderToString(
      React.createElement(WeeklyLeaderboardWidget, {
        onOpenLeaderboard: onOpen,
      })
    );

    expect(html).toContain('Ranking Semanal');
    expect(html).toContain('Ao Vivo');
    expect(html).toContain('domingo 00h');
    expect(html).toContain('Ver tabela completa');
    expect(html).toContain('Ver Ranking Geral &amp; Classificação Completa');
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
});
