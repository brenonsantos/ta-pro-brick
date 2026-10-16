import { GuessEvaluation } from '../types/game';
import { ScoreBreakdown } from './gameLogic';

export function getHeatBandEmoji(evaluation: GuessEvaluation): string {
  switch (evaluation.heatBand) {
    case 'exact':
      return '🏆';
    case 'bullseye':
      return '🎯';
    case 'win':
      return '🟢';
    case 'hot':
      return '🟠';
    case 'warm':
      return '🟡';
    case 'freezing':
    default:
      return '🔵';
  }
}

export function generateShareText(
  guesses: GuessEvaluation[],
  scoreBreakdown: ScoreBreakdown,
  challengeTitle: string,
  maxAttempts: number = 5,
  challengeNumber?: number
): string {
  const isWin = scoreBreakdown.bestGuess?.isWin ?? false;
  const attemptsUsed = guesses.length;

  const header = challengeNumber
    ? `Tá pro Brick #${challengeNumber}`
    : `Tá pro Brick — Desafio Diário`;
  const resultSummary = isWin
    ? `Acertei em ${attemptsUsed}/${maxAttempts} tentativas! Pontuação: ${scoreBreakdown.totalScore.toLocaleString('pt-BR')} pts`
    : `Não foi dessa vez (${attemptsUsed}/${maxAttempts}). Pontuação: ${scoreBreakdown.totalScore.toLocaleString('pt-BR')} pts`;

  const emojiRows = guesses
    .map((g) => {
      const emoji = getHeatBandEmoji(g);
      const arrow = g.direction === 'higher' ? '▲' : g.direction === 'lower' ? '▼' : '🎯';
      return `${emoji} ${arrow}`;
    })
    .join('\n');

  return `${header}\n${challengeTitle}\n\n${resultSummary}\n\n${emojiRows}\n\nJogue em: taprobrick.com.br`;
}
