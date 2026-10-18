import React, { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Award, Users } from 'lucide-react';
import { getWeeklyLeaderboard, WeeklyLeaderboardEntry } from '../services/rankingService';
import { getCurrentWeekRange } from '../utils/dailyChallenge';
import { getOrCreatePlayerProfile } from '../services/playerService';

interface WeeklyLeaderboardWidgetProps {
  onOpenLeaderboard: () => void;
  className?: string;
}

export const WeeklyLeaderboardWidget: React.FC<WeeklyLeaderboardWidgetProps> = ({
  onOpenLeaderboard,
  className = '',
}) => {
  const [entries, setEntries] = useState<WeeklyLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const profile = getOrCreatePlayerProfile();
  const weekInfo = getCurrentWeekRange();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getWeeklyLeaderboard()
      .then((data) => {
        if (isMounted) {
          setEntries(data);
        }
      })
      .catch((err) => {
        console.warn('Erro ao carregar ranking semanal no widget:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentPlayerEntry = entries.find((e) => e.isCurrentPlayer || e.playerId === profile.id);
  const topThree = entries.slice(0, 3);
  const isPlayerInTopThree = currentPlayerEntry && currentPlayerEntry.rank <= 3;

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-zinc-950 font-black text-xs shadow-sm shadow-amber-500/30">
          1º
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-300 text-zinc-950 font-black text-xs">
          2º
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-700/80 text-amber-100 font-black text-xs">
          3º
        </span>
      );
    }
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 font-bold text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div
      className={`rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6 backdrop-blur-md shadow-xl transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Trophy className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
              Ranking Semanal
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Ao Vivo
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              {weekInfo.timeRemainingText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
        >
          Ver tabela completa
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="space-y-2.5 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-11 rounded-2xl bg-zinc-900/60 animate-pulse border border-zinc-800/50"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500 space-y-2">
            <Users className="mx-auto h-8 w-8 text-zinc-600 stroke-[1.5]" />
            <p className="font-semibold text-zinc-400">Nenhum piloto no ranking semanal ainda</p>
            <p className="text-[11px] text-zinc-500">
              Conclua o desafio de hoje para ser o primeiro colocado!
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 list */}
            {topThree.map((item) => {
              const isMe = item.isCurrentPlayer || item.playerId === profile.id;
              return (
                <div
                  key={item.playerId}
                  className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 transition border ${
                    isMe
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getRankBadge(item.rank)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs sm:text-sm font-black truncate">
                          {item.nickname}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded shrink-0">
                            Você
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Award className="h-3 w-3 text-emerald-400/80" />
                        {item.gamesWon} {item.gamesWon === 1 ? 'vitória' : 'vitórias'} • {item.gamesPlayed} {item.gamesPlayed === 1 ? 'rodada' : 'rodadas'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-amber-400">
                      {item.totalScore.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[10px] text-zinc-500 block leading-tight">pts</span>
                  </div>
                </div>
              );
            })}

            {/* If player is outside Top 3, display separator and player row */}
            {!isPlayerInTopThree && currentPlayerEntry && (
              <>
                <div className="flex items-center justify-center py-1">
                  <span className="text-zinc-600 text-xs tracking-widest">• • •</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/40 text-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getRankBadge(currentPlayerEntry.rank)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs sm:text-sm font-black truncate">
                          {currentPlayerEntry.nickname}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded shrink-0">
                          Sua Posição
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Award className="h-3 w-3 text-emerald-400" />
                        {currentPlayerEntry.gamesWon} {currentPlayerEntry.gamesWon === 1 ? 'vitória' : 'vitórias'} • {currentPlayerEntry.gamesPlayed} {currentPlayerEntry.gamesPlayed === 1 ? 'rodada' : 'rodadas'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-amber-400">
                      {currentPlayerEntry.totalScore.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[10px] text-zinc-400 block leading-tight">pts</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-4 pt-3.5 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 text-xs font-bold text-zinc-300 hover:border-amber-500/30 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
        >
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          Ver Ranking Geral & Classificação Completa
        </button>
      </div>
    </div>
  );
};
