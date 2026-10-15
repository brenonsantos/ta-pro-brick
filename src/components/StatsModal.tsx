import React from 'react';
import { X, BarChart2, Flame, Trophy } from 'lucide-react';
import { PlayerStats } from '../utils/statsManager';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  currentAttempt?: number;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  currentAttempt,
}) => {
  if (!isOpen) return null;

  const winPercentage =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  // Max count to normalize bar width
  const maxDistributionCount = Math.max(
    1,
    ...Object.values(stats.guessDistribution)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] w-full max-w-sm sm:max-w-md overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Estatísticas
              </h2>
              <p className="text-xs text-zinc-400">Seu desempenho no Tá pro Brick</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Big Numbers */}
        <div className="mt-5 grid grid-cols-4 gap-2 text-center">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2.5">
            <div className="text-2xl font-black text-white">{stats.gamesPlayed}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Jogos
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2.5">
            <div className="text-2xl font-black text-emerald-400">{winPercentage}%</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Vitórias
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2.5">
            <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-0.5">
              {stats.currentStreak}
              <Flame className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Sequência
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2.5">
            <div className="text-2xl font-black text-purple-400 flex items-center justify-center gap-0.5">
              {stats.maxStreak}
              <Trophy className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Recorde
            </div>
          </div>
        </div>

        {/* Guess Distribution Bars */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Distribuição de Tentativas
          </h3>

          <div className="space-y-2 text-xs">
            {([1, 2, 3, 4, 5] as const).map((attempt) => {
              const count = stats.guessDistribution[attempt] || 0;
              const isCurrent = currentAttempt === attempt;
              const widthPercent =
                count > 0
                  ? Math.max(12, Math.round((count / maxDistributionCount) * 100))
                  : 8;

              return (
                <div key={attempt} className="flex items-center gap-2">
                  <span className="w-3 text-right font-bold text-zinc-400">
                    {attempt}
                  </span>
                  <div className="flex-1 bg-zinc-900/50 rounded-lg overflow-hidden h-6 flex items-center">
                    <div
                      style={{ width: `${widthPercent}%` }}
                      className={`h-full flex items-center justify-end px-2 font-bold rounded-lg transition-all duration-500 ${
                        isCurrent
                          ? 'bg-amber-500 text-zinc-950 font-black'
                          : count > 0
                          ? 'bg-zinc-700 text-white'
                          : 'bg-zinc-800/60 text-zinc-500'
                      }`}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-zinc-800 hover:bg-zinc-700 py-3 text-xs font-bold uppercase tracking-wide text-zinc-200 transition cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
