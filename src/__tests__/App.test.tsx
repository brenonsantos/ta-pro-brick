import { describe, it, expect } from 'vitest';
import App from '../App';
import React from 'react';
import { renderToString } from 'react-dom/server';

describe('App component', () => {
  it('instantiates and renders App without throwing', () => {
    expect(App).toBeDefined();
    const html = renderToString(React.createElement(App));
    expect(html).toContain('Tá pro Brick');
    // Ensure only the active challenge clue title is rendered initially
    expect(html).toContain('Volkswagen Gol Geração I GTS 1.8 8V Álcool Mec. 2P 1988');
    // Ensure subsequent challenges are not rendered simultaneously
    expect(html).not.toContain('Jeep Renegade Longitude 2023 Flex Aut. Abaixo da Fipe');
    expect(html).not.toContain('1988 Chevrolet Chevette Cinza');
  });

  it('renders single active challenge without duplicate clue sections', () => {
    const html = renderToString(React.createElement(App));
    // Count occurrences of "Pista 1 • Anúncio" in the rendered HTML
    const clue1Matches = html.match(/Pista 1 • Anúncio/g) || [];
    expect(clue1Matches.length).toBe(1);
    // Count occurrences of photo counters (accounting for React SSR comment markers)
    const photoCounterMatches = html.match(/📷[\s\S]*?\d+[\s\S]*?\/[\s\S]*?\d+/g) || [];
    expect(photoCounterMatches.length).toBe(1);
  });
});


