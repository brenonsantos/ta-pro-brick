import React from 'react';
import { GuessEvaluation, HeatBand } from '../types/game';
import { formatBRL } from '../utils/currency';
import { ArrowUp, ArrowDown, Target } from 'lucide-react';

interface GuessHistoryProps {
  guesses: GuessEvaluation[];
  maxAttempts: number;
}

export const GuessHistory: React.FC<GuessHistoryProps> = ({ guesses, maxAttempts }) => {
  const slots = Array.from({ length: maxAttempts }, (_, i) => guesses[i] || null);

  const getHeatBandStyle = (heatBand: HeatBand) => {
    switch (heatBand) {
      case 'exact':
        return {
          bg: 'bg-purple-950/80 border-purple-500/80 text-purple-200',
          badge: 'bg-purple-500 text-white',
          label: 'Cravou! 🏆',
        };
      case 'bullseye':
        return {
          bg: 'bg-fuchsia-950/80 border-fuchsia-500/80 text-fuchsia-200',
          badge: 'bg-fuchsia-500 text-white',
          label: 'Na Mosca! 🎯',
        };
      case 'win':
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200',
          badge: 'bg-emerald-500 text-white',
          label: 'Na Faixa (Vitória) 🟢',
        };
      case 'hot':
        return {
          bg: 'bg-amber-950/60 border-amber-500/60 text-amber-200',
          badge: 'bg-amber-500 text-zinc-950 font-bold',
          label: 'Muito Perto 🔥',
        };
      case 'warm':
        return {
          bg: 'bg-yellow-950/50 border-yellow-500/50 text-yellow-200',
          badge: 'bg-yellow-500 text-zinc-950 font-bold',
          label: 'Morno 🟡',
        };
      case 'freezing':
      default:
        return {
          bg: 'bg-blue-950/50 border-blue-500/50 text-blue-200',
          badge: 'bg-blue-500 text-white',
          label: 'Frio ❄️',
        };
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
          Seus Palpites ({guesses.length}/{maxAttempts})
        </h3>
        <span className="text-xs sm:text-sm text-zinc-500">Wordle dos Motores</span>
      </div>

      <div className="space-y-2.5">
        {slots.map((guess, index) => {
          if (!guess) {
            return (
              <div
                key={`empty-${index}`}
                className="flex items-center justify-between rounded-xl sm:rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/40 px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-zinc-600"
              >
                <span className="font-bold text-zinc-700">#{index + 1}</span>
                <span className="text-xs sm:text-sm tracking-wide text-zinc-700">Aguardando palpite...</span>
                <span className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border border-zinc-800/80" />
              </div>
            );
          }

          const style = getHeatBandStyle(guess.heatBand);

          return (
            <div
              key={`guess-${index}`}
              className={`flex items-center justify-between rounded-xl sm:rounded-2xl border p-3.5 sm:p-4 shadow-md transition-all animate-in fade-in-50 duration-300 ${style.bg}`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/40 text-xs sm:text-sm font-bold text-zinc-300">
                  {index + 1}
                </span>
                <span className="text-base sm:text-xl font-black tracking-tight text-white">
                  {formatBRL(guess.guessValue)}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Heat Band Badge */}
                <span className={`rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold ${style.badge}`}>
                  {style.label}
                </span>

                {/* Direction Indicator */}
                <div className="flex items-center">
                  {guess.direction === 'higher' && (
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-400">
                      <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" /> Maior
                    </span>
                  )}
                  {guess.direction === 'lower' && (
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-rose-400">
                      <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" /> Menor
                    </span>
                  )}
                  {guess.direction === 'exact' && (
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-purple-300">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" /> Na Mosca
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
