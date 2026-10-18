import React, { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Award, Users, Calendar, Clock } from 'lucide-react';
import {
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  LeaderboardEntry,
  WeeklyLeaderboardEntry,
} from '../services/rankingService';
import { getCurrentWeekRange } from '../utils/dailyChallenge';
import { getOrCreatePlayerProfile } from '../services/playerService';

export interface WeeklyLeaderboardWidgetProps {
  onOpenLeaderboard: (tab: 'daily' | 'weekly') => void;
  challengeId?: string;
  dayNumber?: number;
  initialTab?: 'daily' | 'weekly';
  className?: string;
}

export const WeeklyLeaderboardWidget: React.FC<WeeklyLeaderboardWidgetProps> = ({
  onOpenLeaderboard,
  challengeId,
  dayNumber,
  initialTab = 'daily',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>(initialTab);
  const [dailyEntries, setDailyEntries] = useState<LeaderboardEntry[]>([]);
  const [weeklyEntries, setWeeklyEntries] = useState<WeeklyLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const profile = getOrCreatePlayerProfile();
  const weekInfo = getCurrentWeekRange();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const [dailyData, weeklyData] = await Promise.all([
          challengeId ? getDailyLeaderboard(challengeId) : Promise.resolve([]),
          getWeeklyLeaderboard(),
        ]);

        if (isMounted) {
          setDailyEntries(dailyData);
          setWeeklyEntries(weeklyData);
        }
      } catch (err) {
        console.warn('Erro ao carregar rankings no widget:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [challengeId]);

  const currentDailyPlayer = dailyEntries.find((e) => e.isCurrentPlayer || e.playerId === profile.id);
  const topDaily = dailyEntries.slice(0, 3);
  const isDailyPlayerInTopThree = currentDailyPlayer && currentDailyPlayer.rank <= 3;

  const currentWeeklyPlayer = weeklyEntries.find((e) => e.isCurrentPlayer || e.playerId === profile.id);
  const topWeekly = weeklyEntries.slice(0, 3);
  const isWeeklyPlayerInTopThree = currentWeeklyPlayer && currentWeeklyPlayer.rank <= 3;

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
      className={`rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 backdrop-blur-md shadow-xl transition-all space-y-3.5 ${className}`}
    >
      {/* Tab Switcher (Segmented Control) */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-900/90 p-1 border border-zinc-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition cursor-pointer ${
            activeTab === 'daily'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Ranking de Hoje{dayNumber ? ` (#${dayNumber})` : ''}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition cursor-pointer ${
            activeTab === 'weekly'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Ranking Semanal</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            {activeTab === 'daily' ? <Calendar className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              {activeTab === 'daily' ? (
                <>
                  Ranking do Desafio {dayNumber ? `#${dayNumber}` : 'Diário'}
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-full">
                    Ao Vivo
                  </span>
                </>
              ) : (
                <>
                  Ranking Semanal
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-full">
                    Ao Vivo
                  </span>
                </>
              )}
            </h3>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
              {activeTab === 'daily' ? (
                'Classificação dos pilotos no desafio de hoje'
              ) : (
                <>
                  <Clock className="h-3 w-3 text-amber-400/80 shrink-0" />
                  <span>{weekInfo.timeRemainingText}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenLeaderboard(activeTab)}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition shrink-0 ml-auto"
        >
          Ver tabela completa
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2 py-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-11 rounded-2xl bg-zinc-900/60 animate-pulse border border-zinc-800/50"
              />
            ))}
          </div>
        ) : activeTab === 'daily' ? (
          /* Daily tab content */
          dailyEntries.length === 0 ? (
            <div className="py-5 text-center text-xs text-zinc-500 space-y-1.5">
              <Users className="mx-auto h-7 w-7 text-zinc-600 stroke-[1.5]" />
              <p className="font-semibold text-zinc-400">Nenhum piloto no ranking de hoje ainda</p>
              <p className="text-[11px] text-zinc-500">
                Os resultados registrados na rodada de hoje aparecerão aqui.
              </p>
            </div>
          ) : (
            <>
              {topDaily.map((item) => {
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
                          {item.attemptsCount} {item.attemptsCount === 1 ? 'chute' : 'chutes'}
                          {item.completedAt && ` • ${item.completedAt}`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-amber-400">
                        {item.score.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[10px] text-zinc-500 block leading-tight">pts</span>
                    </div>
                  </div>
                );
              })}

              {!isDailyPlayerInTopThree && currentDailyPlayer && (
                <>
                  <div className="flex items-center justify-center py-0.5">
                    <span className="text-zinc-600 text-xs tracking-widest">• • •</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/40 text-white">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getRankBadge(currentDailyPlayer.rank)}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs sm:text-sm font-black truncate">
                            {currentDailyPlayer.nickname}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded shrink-0">
                            Sua Posição
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Award className="h-3 w-3 text-emerald-400" />
                          {currentDailyPlayer.attemptsCount} {currentDailyPlayer.attemptsCount === 1 ? 'chute' : 'chutes'}
                          {currentDailyPlayer.completedAt && ` • ${currentDailyPlayer.completedAt}`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-amber-400">
                        {currentDailyPlayer.score.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[10px] text-zinc-400 block leading-tight">pts</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )
        ) : (
          /* Weekly tab content */
          weeklyEntries.length === 0 ? (
            <div className="py-5 text-center text-xs text-zinc-500 space-y-1.5">
              <Users className="mx-auto h-7 w-7 text-zinc-600 stroke-[1.5]" />
              <p className="font-semibold text-zinc-400">Nenhum piloto no ranking semanal ainda</p>
              <p className="text-[11px] text-zinc-500">
                Conclua os desafios ao longo da semana para acumular pontos!
              </p>
            </div>
          ) : (
            <>
              {topWeekly.map((item) => {
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

              {!isWeeklyPlayerInTopThree && currentWeeklyPlayer && (
                <>
                  <div className="flex items-center justify-center py-0.5">
                    <span className="text-zinc-600 text-xs tracking-widest">• • •</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/40 text-white">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getRankBadge(currentWeeklyPlayer.rank)}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs sm:text-sm font-black truncate">
                            {currentWeeklyPlayer.nickname}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded shrink-0">
                            Sua Posição
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Award className="h-3 w-3 text-emerald-400" />
                          {currentWeeklyPlayer.gamesWon} {currentWeeklyPlayer.gamesWon === 1 ? 'vitória' : 'vitórias'} • {currentWeeklyPlayer.gamesPlayed} {currentWeeklyPlayer.gamesPlayed === 1 ? 'rodada' : 'rodadas'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-amber-400">
                        {currentWeeklyPlayer.totalScore.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[10px] text-zinc-400 block leading-tight">pts</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-2 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={() => onOpenLeaderboard(activeTab)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 text-xs font-bold text-zinc-300 hover:border-amber-500/30 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
        >
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          {activeTab === 'daily'
            ? 'Ver Classificação Diária Completa'
            : 'Ver Ranking Semanal Completo'}
        </button>
      </div>
    </div>
  );
};

export const LeaderboardWidget = WeeklyLeaderboardWidget;
