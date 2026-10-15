import React from 'react';
import { GuessEvaluation } from '../types/game';
import { formatBRL } from '../utils/currency';
import { ArrowUp, ArrowDown, Target, Eye, Sparkles } from 'lucide-react';

interface LastGuessFeedbackProps {
  lastGuess: GuessEvaluation;
  attemptNumber: number;
  unlockedClueLabel?: string;
  onViewClue?: () => void;
}

export const LastGuessFeedback: React.FC<LastGuessFeedbackProps> = ({
  lastGuess,
  attemptNumber,
  unlockedClueLabel,
  onViewClue,
}) => {
  const getHeatBandStyle = () => {
    switch (lastGuess.heatBand) {
      case 'exact':
        return {
          cardBg: 'bg-purple-950/40 border-purple-500/50',
          badge: 'bg-purple-500 text-white',
          label: 'Cravou! 🏆',
        };
      case 'bullseye':
        return {
          cardBg: 'bg-fuchsia-950/40 border-fuchsia-500/50',
          badge: 'bg-fuchsia-500 text-white',
          label: 'Na Mosca! 🎯',
        };
      case 'win':
        return {
          cardBg: 'bg-emerald-950/40 border-emerald-500/50',
          badge: 'bg-emerald-500 text-white',
          label: 'Na Faixa (Vitória) 🟢',
        };
      case 'hot':
        return {
          cardBg: 'bg-amber-950/40 border-amber-500/50',
          badge: 'bg-amber-500 text-zinc-950 font-bold',
          label: 'Muito Perto 🔥',
        };
      case 'warm':
        return {
          cardBg: 'bg-yellow-950/30 border-yellow-500/40',
          badge: 'bg-yellow-500 text-zinc-950 font-bold',
          label: 'Morno 🟡',
        };
      case 'freezing':
      default:
        return {
          cardBg: 'bg-blue-950/30 border-blue-500/40',
          badge: 'bg-blue-500 text-white',
          label: 'Frio ❄️',
        };
    }
  };

  const style = getHeatBandStyle();

  return (
    <div
      className={`rounded-2xl border p-4 shadow-xl backdrop-blur-md animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ${style.cardBg}`}
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
            #{attemptNumber}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Resultado do Palpite:
          </span>
        </div>
        <span className="text-base sm:text-lg font-black tracking-tight text-white">
          {formatBRL(lastGuess.guessValue)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5">
        <div className="flex items-center gap-2">
          {/* Heat badge */}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.badge}`}>
            {style.label}
          </span>

          {/* Direction indicator */}
          <div className="flex items-center">
            {lastGuess.direction === 'higher' && (
              <span className="flex items-center gap-1 text-xs sm:text-sm font-extrabold text-emerald-400">
                <ArrowUp className="h-4 w-4 stroke-[3]" /> O dono pediu mais
              </span>
            )}
            {lastGuess.direction === 'lower' && (
              <span className="flex items-center gap-1 text-xs sm:text-sm font-extrabold text-rose-400">
                <ArrowDown className="h-4 w-4 stroke-[3]" /> O dono pediu menos
              </span>
            )}
            {lastGuess.direction === 'exact' && (
              <span className="flex items-center gap-1 text-xs sm:text-sm font-extrabold text-purple-300">
                <Target className="h-4 w-4 stroke-[3]" /> Cravou o valor!
              </span>
            )}
          </div>
        </div>

        {/* Unlocked clue alert & shortcut */}
        {unlockedClueLabel && (
          <button
            type="button"
            onClick={onViewClue}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-400/30 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Pista liberada: <strong>{unlockedClueLabel}</strong></span>
            <Eye className="h-3.5 w-3.5 ml-0.5" />
          </button>
        )}
      </div>
    </div>
  );
};
