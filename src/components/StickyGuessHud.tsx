import React from 'react';
import { GuessEvaluation } from '../types/game';
import { formatBRL } from '../utils/currency';
import { ArrowUp, ArrowDown, Target, ArrowDownCircle } from 'lucide-react';

interface StickyGuessHudProps {
  lastGuess: GuessEvaluation;
  attemptNumber: number;
  onScrollToInput: () => void;
}

export const StickyGuessHud: React.FC<StickyGuessHudProps> = ({
  lastGuess,
  attemptNumber,
  onScrollToInput,
}) => {
  const getBadgeStyle = () => {
    switch (lastGuess.heatBand) {
      case 'exact':
        return 'bg-purple-500 text-white';
      case 'bullseye':
        return 'bg-fuchsia-500 text-white';
      case 'win':
        return 'bg-emerald-500 text-white';
      case 'hot':
        return 'bg-amber-500 text-zinc-950 font-bold';
      case 'warm':
        return 'bg-yellow-500 text-zinc-950 font-bold';
      case 'freezing':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getHeatLabel = () => {
    switch (lastGuess.heatBand) {
      case 'exact': return 'Cravou! 🏆';
      case 'bullseye': return 'Na Mosca! 🎯';
      case 'win': return 'Vitória! 🟢';
      case 'hot': return 'Muito Perto 🔥';
      case 'warm': return 'Morno 🟡';
      case 'freezing': default: return 'Frio ❄️';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-zinc-950/95 border-b border-zinc-800 shadow-2xl backdrop-blur-md px-3 sm:px-6 py-2.5 animate-in slide-in-from-top-4 duration-300">
      <div className="max-w-xl md:max-w-2xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-bold text-zinc-300">
            #{attemptNumber}
          </span>
          <span className="text-xs sm:text-sm font-black text-white">
            {formatBRL(lastGuess.guessValue)}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${getBadgeStyle()}`}>
            {getHeatLabel()}
          </span>

          <div className="flex items-center">
            {lastGuess.direction === 'higher' && (
              <span className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-emerald-400">
                <ArrowUp className="h-3.5 w-3.5 stroke-[3]" /> O dono pediu mais
              </span>
            )}
            {lastGuess.direction === 'lower' && (
              <span className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-rose-400">
                <ArrowDown className="h-3.5 w-3.5 stroke-[3]" /> O dono pediu menos
              </span>
            )}
            {lastGuess.direction === 'exact' && (
              <span className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-purple-300">
                <Target className="h-3.5 w-3.5 stroke-[3]" /> Cravou!
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onScrollToInput}
          className="shrink-0 flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-zinc-950 shadow-md transition active:scale-95 cursor-pointer"
        >
          <span>Chutar</span>
          <ArrowDownCircle className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
