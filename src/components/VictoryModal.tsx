import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../types/game';
import { ScoreBreakdown } from '../utils/gameLogic';
import { formatBRL } from '../utils/currency';
import { generateShareText } from '../utils/shareText';
import { Trophy, Share2, Check, ArrowRight, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';

interface VictoryModalProps {
  gameState: GameState;
  scoreBreakdown: ScoreBreakdown;
  onContinuePlaying: () => void;
  onEndRound: () => void;
  onRestartPrototype: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  gameState,
  scoreBreakdown,
  onContinuePlaying,
  onEndRound,
  onRestartPrototype,
}) => {
  const [copied, setCopied] = useState(false);
  const isWon = scoreBreakdown.bestGuess?.isWin ?? false;
  const isWonCanContinue = gameState.status === 'won_can_continue';
  const isCompleted = gameState.status === 'completed';

  const remainingAttempts = gameState.maxAttempts - gameState.guesses.length;

  useEffect(() => {
    if (isWon) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'],
      });
    }
  }, [isWon]);

  const handleShare = async () => {
    const text = generateShareText(
      gameState.guesses,
      scoreBreakdown,
      gameState.challenge.title,
      gameState.maxAttempts
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

  if (!isWonCanContinue && !isCompleted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md sm:max-w-xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Modal Header */}
        <div className="text-center">
          <div className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            {isWon ? <Trophy className="h-9 w-9" /> : <AlertTriangle className="h-9 w-9 text-rose-400" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isWonCanContinue
              ? 'Você Acertou o Preço! 🎯'
              : isWon
              ? 'Desafio Concluído! 🏆'
              : 'Fim de Jogo! 🏁'}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-400">
            {isWonCanContinue
              ? 'Seu palpite entrou na margem de tolerância de vitória.'
              : isWon
              ? 'Excelente leitura do mercado automotivo.'
              : 'O preço pedido pelo vendedor era diferente do esperado.'}
          </p>
        </div>

        {/* Score & Asking Price Panel */}
        <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-3.5">
          {/* True Price (Revealed on completion) */}
          {isCompleted && (
            <div className="border-b border-zinc-800 pb-4 text-center">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
                Preço Pedido pelo Vendedor
              </span>
              <div className="mt-1 text-3xl sm:text-4xl font-black text-amber-400">
                {formatBRL(gameState.challenge.askingPrice)}
              </div>
              <div className="mt-1.5 text-xs sm:text-sm text-zinc-400">
                Seu melhor palpite: <strong className="text-zinc-200">{formatBRL(scoreBreakdown.bestGuess?.guessValue ?? 0)}</strong>{' '}
                (diferença de {formatBRL(scoreBreakdown.bestGuess?.absoluteDifference ?? 0)})
              </div>
            </div>
          )}

          {/* Score details */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-zinc-400">Pontuação Base ({scoreBreakdown.tier || 'Precisão'}):</span>
            <span className="font-bold text-zinc-200">
              {scoreBreakdown.baseScore.toLocaleString('pt-BR')} pts
            </span>
          </div>

          {isWon && (
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-zinc-400">
                Bônus de Tentativas ({remainingAttempts} restantes):
              </span>
              <span className="font-bold text-emerald-400">
                +{scoreBreakdown.bonusScore.toLocaleString('pt-BR')} pts
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-zinc-800 pt-3 text-sm sm:text-base font-extrabold">
            <span className="text-white">Pontuação Total:</span>
            <span className="text-base sm:text-xl text-amber-400">
              {scoreBreakdown.totalScore.toLocaleString('pt-BR')} pts
            </span>
          </div>
        </div>

        {/* Action Choice: When Won and can continue */}
        {isWonCanContinue && (
          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs sm:text-sm text-zinc-300">
              <span className="font-bold text-amber-400">Dilema de Risco:</span> Você pode <strong>encerrar agora</strong> e garantir seus <strong>+{scoreBreakdown.bonusScore} pts</strong> de bônus, ou <strong>arriscar</strong> para tentar bater na mosca (1%) ou cravar o valor!
            </div>

            <button
              onClick={onEndRound}
              className="flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-amber-500 py-3.5 sm:py-4 text-sm sm:text-base font-black uppercase tracking-wide text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition active:scale-[0.98] cursor-pointer"
            >
              <Check className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
              Encerrar Rodada e Salvar Pontos
            </button>

            <button
              onClick={onContinuePlaying}
              className="flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-zinc-700 bg-zinc-900 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              Arriscar Mais Palpites ({remainingAttempts} restantes)
            </button>
          </div>
        )}

        {/* Action Choice: When Round is Completed */}
        {isCompleted && (
          <div className="mt-6 space-y-3">
            <button
              onClick={handleShare}
              className="flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-amber-500 py-4 text-sm sm:text-base font-black uppercase tracking-wide text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition active:scale-[0.98] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 stroke-[2.5] text-emerald-950" />
                  Resultado Copiado!
                </>
              ) : (
                <>
                  <Share2 className="h-5 w-5 stroke-[2.5]" />
                  Compartilhar Resultado
                </>
              )}
            </button>

            {gameState.challenge.originalUrl && (
              <a
                href={gameState.challenge.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-zinc-800 bg-zinc-900/60 py-3 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Anúncio Original Simulado
              </a>
            )}

            <button
              onClick={onRestartPrototype}
              className="flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-dashed border-zinc-800 py-2.5 text-xs sm:text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar Protótipo para Novo Teste
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
