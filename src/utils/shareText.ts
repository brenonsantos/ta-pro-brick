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

export type ShareOutcome = 'shared' | 'copied' | 'dismissed';

/**
 * Compartilha o resultado do jogo abrindo o menu nativo do celular (WhatsApp, Instagram, etc)
 * via Web Share API quando disponível, com fallback automático para cópia na área de transferência.
 */
export async function shareGameResult(options: {
  text: string;
  title?: string;
}): Promise<ShareOutcome> {
  const { text, title = 'Tá pro Brick' } = options;

  // 1. Tentar Web Share API nativo (iOS / Android / navegadores com suporte)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const canShare = !navigator.canShare || navigator.canShare({ text });
      if (canShare) {
        await navigator.share({
          title,
          text,
        });
        return 'shared';
      }
    } catch (err: any) {
      // Usuário cancelou ou fechou a folha de compartilhamento nativa sem selecionar app
      if (err?.name === 'AbortError') {
        return 'dismissed';
      }
      // Se falhou por outro motivo (ex: permissões), segue para o fallback de clipboard
    }
  }

  // 2. Fallback: Copiar para área de transferência
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    // Ambientes sem suporte a clipboard
  }

  return 'copied';
}

