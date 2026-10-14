import React from 'react';
import { Challenge } from '../types/game';
import { CheckCircle2 } from 'lucide-react';

interface VehicleSelectorProps {
  challenges: Challenge[];
  activeChallengeId: string;
  completedChallengeIds: string[];
  onSelectChallenge: (challenge: Challenge) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  challenges,
  activeChallengeId,
  completedChallengeIds,
  onSelectChallenge,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
          Carros de Teste ({challenges.findIndex((c) => c.id === activeChallengeId) + 1} de {challenges.length})
        </span>
        <span className="text-[11px] sm:text-xs text-amber-400/90 font-medium">
          Protótipo Multicarros
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:justify-start">
        {challenges.map((c, index) => {
          const isActive = c.id === activeChallengeId;
          const isCompleted = completedChallengeIds.includes(c.id);

          return (
            <button
              key={c.id}
              onClick={() => onSelectChallenge(c)}
              className={`flex items-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                  : 'bg-zinc-950/80 text-zinc-300 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              <span>{index + 1}. {c.shortName || c.title.split(' ')[0]}</span>
              {isCompleted && (
                <CheckCircle2
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    isActive ? 'text-zinc-950' : 'text-emerald-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
