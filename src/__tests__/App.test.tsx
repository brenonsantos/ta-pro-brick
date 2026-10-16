import { describe, it, expect } from 'vitest';
import App from '../App';
import React from 'react';
import { renderToString } from 'react-dom/server';
import mockChallengesData from '../data/mockChallenges.json';
import { getDailyChallengeIndex } from '../utils/dailyChallenge';
import { getTodayDateString } from '../utils/statsManager';

describe('App component', () => {
  it('instantiates and renders App without throwing', () => {
    expect(App).toBeDefined();
    const html = renderToString(React.createElement(App));
    expect(html).toContain('Tá pro Brick');

    const dailyIdx = getDailyChallengeIndex(mockChallengesData.length, getTodayDateString());
    const dailyChallenge = mockChallengesData[dailyIdx];
    expect(html).toContain(dailyChallenge.title);

    // Other challenges should not be rendered simultaneously in daily mode
    const otherChallenges = mockChallengesData.filter((_, idx) => idx !== dailyIdx);
    otherChallenges.forEach((other) => {
      expect(html).not.toContain(other.title);
    });
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
