import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../types/game';
import { ScoreBreakdown } from '../utils/gameLogic';
import { formatBRL } from '../utils/currency';
import { generateShareText } from '../utils/shareText';
import { Trophy, Share2, Check, ArrowRight, AlertTriangle, ExternalLink, BarChart2, X, Eye } from 'lucide-react';

interface VictoryModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  gameState: GameState;
  scoreBreakdown: ScoreBreakdown;
  onContinuePlaying: () => void;
  onEndRound: () => void;
  onNextChallenge?: () => void;
  hasNextChallenge?: boolean;
  onOpenStats?: () => void;
  challengeNumber?: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen = true,
  onClose,
  gameState,
  scoreBreakdown,
  onContinuePlaying,
  onEndRound,
  onNextChallenge,
  hasNextChallenge,
  onOpenStats,
  challengeNumber,
}) => {
  const [copied, setCopied] = useState(false);
  const isWon = scoreBreakdown.bestGuess?.isWin ?? false;
  const isWonCanContinue = gameState.status === 'won_can_continue';
  const isCompleted = gameState.status === 'completed';

  const remainingAttempts = gameState.maxAttempts - gameState.guesses.length;

  useEffect(() => {
    if (isWon && isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'],
      });
    }
  }, [isWon, isOpen]);

  const handleShare = async () => {
    const text = generateShareText(
      gameState.guesses,
      scoreBreakdown,
      gameState.challenge.title,
      gameState.maxAttempts,
      challengeNumber
    );

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen || (!isWonCanContinue && !isCompleted)) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Close Button only when round is completed (not during dilemma choice) */}
        {onClose && isCompleted && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            aria-label="Fechar para rever o anúncio"
            title="Fechar e rever anúncio"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            {isWon ? <Trophy className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8 text-rose-400" />}
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {isWonCanContinue
              ? 'Você Acertou! 🎯'
              : isWon
              ? 'Desafio Concluído! 🏆'
              : 'Fim de Jogo! 🏁'}
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            {isWonCanContinue
              ? 'Seu chute entrou na faixa de acerto!'
              : isWon
              ? 'Excelente leitura do mercado automotivo.'
              : 'O preço do anúncio era diferente do esperado.'}
          </p>
        </div>

        {/* Dilemma View: When Won and can still risk attempts */}
        {isWonCanContinue && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Pontuação Garantida
              </span>
              <div className="mt-0.5 text-3xl font-black text-white">
                {scoreBreakdown.totalScore.toLocaleString('pt-BR')} pts
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Inclui <strong className="text-emerald-400">+{scoreBreakdown.bonusScore.toLocaleString('pt-BR')} pts</strong> de bônus por {remainingAttempts} {remainingAttempts === 1 ? 'tentativa restante' : 'tentativas restantes'}.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onEndRound}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-black uppercase tracking-wide text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition active:scale-[0.98] cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                Garantir Vitória e Pontos
              </button>

              <button
                type="button"
                onClick={onContinuePlaying}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 py-3 text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
              >
                <ArrowRight className="h-4 w-4" />
                Arriscar para Cravar ({remainingAttempts} {remainingAttempts === 1 ? 'restante' : 'restantes'})
              </button>
            </div>
          </div>
        )}

        {/* Completed View: Final Result */}
        {isCompleted && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
              <div className="text-center pb-3 border-b border-zinc-800/80">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Preço Real do Anúncio
                </span>
                <div className="mt-0.5 text-3xl font-black text-amber-400">
                  {formatBRL(gameState.challenge.askingPrice)}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Seu melhor: <strong className="text-zinc-200">{formatBRL(scoreBreakdown.bestGuess?.guessValue ?? 0)}</strong>
                  {scoreBreakdown.bestGuess && (
                    <span> (dif. {formatBRL(scoreBreakdown.bestGuess.absoluteDifference)})</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-zinc-400">Pontuação Final:</span>
                <span className="text-base sm:text-lg font-black text-amber-400">
                  {scoreBreakdown.totalScore.toLocaleString('pt-BR')} pts
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {hasNextChallenge && onNextChallenge && (
                <button
                  type="button"
                  onClick={onNextChallenge}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-black uppercase tracking-wide text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition active:scale-[0.98] cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                  Próximo Carro do Treino 🚗
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black uppercase tracking-wide transition active:scale-[0.98] cursor-pointer ${
                  hasNextChallenge
                    ? 'border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800'
                    : 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 stroke-[2.5] text-emerald-400" />
                    Resultado Copiado!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Compartilhar Resultado
                  </>
                )}
              </button>

              {gameState.challenge.originalUrl && (
                <a
                  href={gameState.challenge.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
                  Ver Anúncio Original ↗
                </a>
              )}

              {onOpenStats && (
                <button
                  type="button"
                  onClick={onOpenStats}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                >
                  <BarChart2 className="h-4 w-4 text-amber-400" />
                  Ver Minhas Estatísticas
                </button>
              )}

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Fechar para rever fotos e anúncio
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
