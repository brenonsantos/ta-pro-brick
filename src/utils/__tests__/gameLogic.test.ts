import { describe, it, expect } from 'vitest';
import { evaluateGuess, calculateScore } from '../gameLogic';
import { formatBRL, parseBRLInput } from '../currency';
import { generateShareText } from '../shareText';
import { GAME_CONFIG } from '../../config/gameConfig';

describe('gameLogic - evaluateGuess', () => {
  const askingPrice = 50000;

  it('detects direction correctly', () => {
    const low = evaluateGuess(40000, askingPrice);
    expect(low.direction).toBe('higher');

    const high = evaluateGuess(60000, askingPrice);
    expect(high.direction).toBe('lower');

    const exact = evaluateGuess(50000, askingPrice);
    expect(exact.direction).toBe('exact');
  });

  it('classifies exact match within R$ 1', () => {
    const exact1 = evaluateGuess(50000, askingPrice);
    expect(exact1.isWin).toBe(true);
    expect(exact1.tier).toBe('exact');
    expect(exact1.heatBand).toBe('exact');

    const exact2 = evaluateGuess(50001, askingPrice);
    expect(exact2.isWin).toBe(true);
    expect(exact2.tier).toBe('exact');
    expect(exact2.heatBand).toBe('exact');
  });

  it('classifies bullseye within 1%', () => {
    // 1% of 50,000 is 500. So 50,400 is within 1% (diff 400).
    const bullseye = evaluateGuess(50400, askingPrice);
    expect(bullseye.isWin).toBe(true);
    expect(bullseye.tier).toBe('bullseye');
    expect(bullseye.heatBand).toBe('bullseye');
  });

  it('classifies standard win within 5%', () => {
    // 5% of 50,000 is 2,500. So 52,000 is within 5% (diff 2,000).
    const win = evaluateGuess(52000, askingPrice);
    expect(win.isWin).toBe(true);
    expect(win.tier).toBe('standard');
    expect(win.heatBand).toBe('win');
  });

  it('applies minimum floor of R$ 1,000 for low value vehicles', () => {
    const cheapCarPrice = 10000;
    // 5% of 10,000 is 500, but minimum floor is 1,000.
    // So a guess of 10,800 (diff 800) should be considered standard win!
    const win = evaluateGuess(10800, cheapCarPrice);
    expect(win.isWin).toBe(true);
    expect(win.tier).toBe('standard');
  });

  it('classifies heat bands: hot, warm, freezing', () => {
    // Hot: between 5% and 20%
    const hot = evaluateGuess(58000, askingPrice); // diff 8,000 = 16%
    expect(hot.isWin).toBe(false);
    expect(hot.heatBand).toBe('hot');

    // Warm: between 20% and 50%
    const warm = evaluateGuess(70000, askingPrice); // diff 20,000 = 40%
    expect(warm.isWin).toBe(false);
    expect(warm.heatBand).toBe('warm');

    // Freezing: > 50%
    const freezing = evaluateGuess(85000, askingPrice); // diff 35,000 = 70%
    expect(freezing.isWin).toBe(false);
    expect(freezing.heatBand).toBe('freezing');
  });
});

describe('gameLogic - calculateScore', () => {
  const askingPrice = 50000;

  it('calculates score for standard win on attempt 2 (4 unused attempts)', () => {
    const guess1 = evaluateGuess(70000, askingPrice);
    const guess2 = evaluateGuess(52000, askingPrice); // standard win
    const result = calculateScore([guess1, guess2], 4);

    expect(result.baseScore).toBe(GAME_CONFIG.scoring.standardWinBasePoints); // 6000
    expect(result.bonusScore).toBe(4 * 500); // 2000
    expect(result.totalScore).toBe(8000);
  });

  it('preserves best guess when player continues and makes a worse guess', () => {
    const guess1 = evaluateGuess(52000, askingPrice); // standard win (diff 2000)
    const guess2 = evaluateGuess(60000, askingPrice); // worse guess (diff 10000)
    const result = calculateScore([guess1, guess2], 3);

    expect(result.bestGuess?.guessValue).toBe(52000);
    expect(result.bestGuess?.isWin).toBe(true);
    expect(result.baseScore).toBe(6000);
    expect(result.bonusScore).toBe(3 * 500); // 1500
    expect(result.totalScore).toBe(7500);
  });

  it('awards higher tier when player continues and hits Bullseye', () => {
    const guess1 = evaluateGuess(52000, askingPrice); // standard win
    const guess2 = evaluateGuess(50300, askingPrice); // bullseye
    const result = calculateScore([guess1, guess2], 3);

    expect(result.bestGuess?.guessValue).toBe(50300);
    expect(result.tier).toBe('bullseye');
    expect(result.baseScore).toBe(GAME_CONFIG.scoring.bullseyeBasePoints); // 8500
    expect(result.bonusScore).toBe(3 * 500); // 1500
    expect(result.totalScore).toBe(10000);
  });
});

describe('currency utilities', () => {
  it('formats BRL correctly', () => {
    const formatted = formatBRL(38500);
    expect(formatted).toContain('38.500');
    expect(formatted).toContain('R$');
  });

  it('parses raw BRL text input into integer', () => {
    expect(parseBRLInput('38.500')).toBe(38500);
    expect(parseBRLInput('R$ 45.000,00')).toBe(4500000);
    expect(parseBRLInput('abc')).toBe(0);
    expect(parseBRLInput('')).toBe(0);
  });
});

describe('shareText generator', () => {
  it('generates a clean spoiler-free message', () => {
    const guesses = [
      evaluateGuess(70000, 50000), // warm
      evaluateGuess(52000, 50000), // win
    ];
    const score = calculateScore(guesses, 4);
    const text = generateShareText(guesses, score, 'Gol Quadrado 1994');

    expect(text).toContain('Gol Quadrado 1994');
    expect(text).toContain('Acertei em 2/6 tentativas!');
    expect(text).toContain('8.000 pts');
    expect(text).toContain('🟡');
    expect(text).toContain('🟢');
    // Ensure asking price (50.000) is NOT leaked in the text!
    expect(text).not.toContain('50.000');
    expect(text).not.toContain('50000');
  });
});
