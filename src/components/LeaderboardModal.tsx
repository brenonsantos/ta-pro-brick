import React, { useState, useEffect } from 'react';
import { Trophy, X, Edit2, Check, Flame, Shield, LogIn } from 'lucide-react';
import {
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  LeaderboardEntry,
  AllTimeLeaderboardEntry,
} from '../services/rankingService';
import {
  getOrCreatePlayerProfile,
  updatePlayerNickname,
  signInWithGoogle,
  PlayerProfile,
} from '../services/playerService';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  hasPlayedToday: boolean;
  dayNumber?: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  challengeId,
  hasPlayedToday,
  dayNumber = 1,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'allTime'>('daily');
  const [profile, setProfile] = useState<PlayerProfile>(() => getOrCreatePlayerProfile());
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(profile.nickname);
  const [dailyEntries, setDailyEntries] = useState<LeaderboardEntry[]>([]);
  const [allTimeEntries, setAllTimeEntries] = useState<AllTimeLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setProfile(getOrCreatePlayerProfile());
    setNicknameInput(getOrCreatePlayerProfile().nickname);
    setIsLoading(true);

    Promise.all([
      getDailyLeaderboard(challengeId),
      getAllTimeLeaderboard(),
    ]).then(([daily, allTime]) => {
      setDailyEntries(daily);
      setAllTimeEntries(allTime);
      setIsLoading(false);
    });
  }, [isOpen, challengeId]);

  if (!isOpen) return null;

  const handleSaveNickname = async () => {
    if (!nicknameInput.trim()) return;
    const updated = await updatePlayerNickname(nicknameInput);
    setProfile(updated);
    setIsEditingNick(false);
    // Recarrega rankings para refletir o novo nome
    const [daily, allTime] = await Promise.all([
      getDailyLeaderboard(challengeId),
      getAllTimeLeaderboard(),
    ]);
    setDailyEntries(daily);
    setAllTimeEntries(allTime);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="text-xs font-bold text-zinc-400">#{rank}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Ranking de Pilotos
              </h2>
              <p className="text-xs text-zinc-400">Classificação por pontos acumulados</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Player Profile & Session Card */}
        <div className="mt-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <Shield className="h-3 w-3 text-amber-400" />
                <span>Seu Piloto no Placar</span>
              </div>
              {isEditingNick ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    maxLength={25}
                    className="flex-1 rounded-lg border border-amber-500/50 bg-zinc-950 px-2 py-1 text-sm font-bold text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveNickname}
                    className="rounded-lg bg-amber-500 p-1.5 text-black hover:bg-amber-400 transition cursor-pointer"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-sm font-black text-amber-300 truncate">
                    {profile.nickname}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingNick(true)}
                    className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer p-0.5"
                    title="Editar apelido"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {profile.isAnonymous && (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-[11px] font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition cursor-pointer shrink-0"
                title="Salvar com Google para jogar em qualquer aparelho"
              >
                <LogIn className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Salvar Conta</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="mt-3.5 grid grid-cols-2 gap-1 rounded-xl bg-zinc-900 p-1 border border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            Hoje (#{dayNumber})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('allTime')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'allTime'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            Geral (Total)
          </button>
        </div>

        {/* Leaderboard List / Anti-Spoiler Banner */}
        <div className="mt-3.5 flex-1 overflow-y-auto min-h-[220px] space-y-1.5 pr-1">
          {isLoading ? (
            <div className="flex h-36 items-center justify-center text-xs text-zinc-500 font-medium">
              Carregando pontuações...
            </div>
          ) : activeTab === 'daily' && !hasPlayedToday ? (
            <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 my-4">
              <span className="text-3xl mb-2">🔒</span>
              <h3 className="text-sm font-black text-white">Ranking Diário Bloqueado</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-[260px]">
                Jogue o desafio de hoje até o final para desbloquear a pontuação e ver como você se saiu contra os outros pilotos!
              </p>
            </div>
          ) : activeTab === 'daily' ? (
            dailyEntries.map((entry) => (
              <div
                key={entry.playerId}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition border ${
                  entry.isCurrentPlayer
                    ? 'border-amber-500/50 bg-amber-500/10 shadow-sm'
                    : 'border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center shrink-0">
                    {getRankBadge(entry.rank)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                      {entry.nickname}
                      {entry.isCurrentPlayer && (
                        <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-black text-amber-300 uppercase border border-amber-500/40">
                          Você
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {entry.won ? `${entry.attemptsCount}º chute • ${entry.completedAt}` : 'Não acertou'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-black text-amber-400">
                    {entry.score.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-zinc-400 ml-1 font-bold">pts</span>
                </div>
              </div>
            ))
          ) : (
            allTimeEntries.map((entry) => (
              <div
                key={entry.playerId}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition border ${
                  entry.isCurrentPlayer
                    ? 'border-amber-500/50 bg-amber-500/10 shadow-sm'
                    : 'border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center shrink-0">
                    {getRankBadge(entry.rank)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                      {entry.nickname}
                      {entry.isCurrentPlayer && (
                        <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-black text-amber-300 uppercase border border-amber-500/40">
                          Você
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {entry.gamesWon} vitórias em {entry.gamesPlayed} jogos
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-black text-amber-400">
                    {entry.totalScore.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-zinc-400 ml-1 font-bold">pts</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-3 border-t border-zinc-800 text-center shrink-0">
          <p className="text-[11px] text-zinc-500">
            A pontuação recompensa precisão no chute e bônus de risco.
          </p>
        </div>
      </div>
    </div>
  );
};
