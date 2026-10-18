import { supabase, isSupabaseConfigured } from './supabase';
import { getOrCreatePlayerProfile, syncPlayerProfileToSupabase } from './playerService';
import { getCurrentWeekRange } from '../utils/dailyChallenge';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  score: number;
  attemptsCount: number;
  won: boolean;
  isCurrentPlayer: boolean;
  completedAt: string;
  completedAtIso?: string;
}

export interface AllTimeLeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  isCurrentPlayer: boolean;
}

export type WeeklyLeaderboardEntry = AllTimeLeaderboardEntry;

export interface SubmitResultParams {
  challengeId: string;
  score: number;
  attemptsCount: number;
  bestGuess: number | null;
  won: boolean;
}

const LOCAL_LEADERBOARD_STORAGE_KEY = 'taprobrick_local_leaderboard';

interface LocalResultStorage {
  [challengeId: string]: LeaderboardEntry[];
}

function getLocalLeaderboardStore(): LocalResultStorage {
  try {
    const data = localStorage.getItem(LOCAL_LEADERBOARD_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveLocalLeaderboardStore(store: LocalResultStorage): void {
  try {
    localStorage.setItem(LOCAL_LEADERBOARD_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore error
  }
}



export async function submitDailyResult(params: SubmitResultParams): Promise<void> {
  const profile = getOrCreatePlayerProfile();
  const nowIso = new Date().toISOString();
  const completedAtTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // 1. Gravar localmente
  const store = getLocalLeaderboardStore();
  const currentList = store[params.challengeId] || [];
  
  // Atualizar ou adicionar entrada do jogador
  const playerEntry: LeaderboardEntry = {
    rank: 0,
    playerId: profile.id,
    nickname: profile.nickname,
    score: params.score,
    attemptsCount: params.attemptsCount,
    won: params.won,
    isCurrentPlayer: true,
    completedAt: completedAtTime,
    completedAtIso: nowIso,
  };

  const filtered = currentList.filter((e) => e.playerId !== profile.id);
  filtered.push(playerEntry);
  store[params.challengeId] = filtered;
  saveLocalLeaderboardStore(store);

  // 2. Se Supabase estiver conectado, gravar no banco
  if (isSupabaseConfigured() && supabase) {
    try {
      // Garante primeiro que o perfil do jogador existe na tabela 'players'
      await syncPlayerProfileToSupabase(profile);

      const { error } = await supabase.from('daily_results').upsert(
        {
          challenge_id: String(params.challengeId),
          player_id: profile.id,
          score: params.score,
          attempts_count: params.attemptsCount,
          best_guess: params.bestGuess,
          won: params.won,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'challenge_id,player_id' }
      );

      if (error) {
        console.error('Erro ao enviar daily_results para o Supabase:', error);
      }
    } catch (err) {
      console.warn('Erro inesperado ao sincronizar resultado com Supabase:', err);
    }
  }
}

export async function getDailyLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
  const profile = getOrCreatePlayerProfile();

  // Se Supabase estiver conectado
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_results')
        .select(`
          player_id,
          score,
          attempts_count,
          won,
          completed_at,
          players (
            nickname
          )
        `)
        .eq('challenge_id', challengeId)
        .order('score', { ascending: false })
        .order('attempts_count', { ascending: true })
        .order('completed_at', { ascending: true })
        .limit(50);

      if (!error && data && data.length > 0) {
        return data.map((item: any, index: number) => ({
          rank: index + 1,
          playerId: item.player_id,
          nickname: item.players?.nickname || 'Piloto Anônimo',
          score: item.score,
          attemptsCount: item.attempts_count,
          won: item.won,
          isCurrentPlayer: item.player_id === profile.id,
          completedAt: new Date(item.completed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        }));
      }
    } catch (err) {
      console.warn('Falha na consulta remota de ranking, usando fallback local:', err);
    }
  }

  // Fallback Local: apenas resultados reais registrados
  const store = getLocalLeaderboardStore();
  const localList = store[challengeId] || [];

  // Mapear entradas identificando o jogador atual e garantindo apelido mais recente
  const entries = localList.map((entry) => ({
    ...entry,
    isCurrentPlayer: entry.playerId === profile.id,
    nickname: entry.playerId === profile.id ? profile.nickname : entry.nickname,
  }));

  // Ordenar por:
  // 1. Pontuação (descendente - mais pontos primeiro)
  // 2. Número de tentativas (ascendente - menos tentativas desempata)
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.attemptsCount - b.attemptsCount;
  });

  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export async function getAllTimeLeaderboard(): Promise<AllTimeLeaderboardEntry[]> {
  const profile = getOrCreatePlayerProfile();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('view_leaderboard_all_time')
        .select('*')
        .limit(50);

      if (!error && data && data.length > 0) {
        return data.map((item: any, index: number) => ({
          rank: index + 1,
          playerId: item.player_id,
          nickname: item.nickname,
          totalScore: item.total_score,
          gamesPlayed: item.games_played,
          gamesWon: item.games_won,
          isCurrentPlayer: item.player_id === profile.id,
        }));
      }
    } catch (err) {
      console.warn('Falha ao buscar ranking geral remoto:', err);
    }
  }

  // Fallback local: calcula a partir dos resultados reais locais salvos
  const store = getLocalLeaderboardStore();
  let localTotalScore = 0;
  let localGamesPlayed = 0;
  let localGamesWon = 0;

  Object.values(store).forEach((list) => {
    const mine = list.find((e) => e.playerId === profile.id);
    if (mine) {
      localTotalScore += mine.score;
      localGamesPlayed += 1;
      if (mine.won) localGamesWon += 1;
    }
  });

  const realEntries: AllTimeLeaderboardEntry[] = [];

  if (localGamesPlayed > 0) {
    realEntries.push({
      rank: 1,
      playerId: profile.id,
      nickname: profile.nickname,
      totalScore: localTotalScore,
      gamesPlayed: localGamesPlayed,
      gamesWon: localGamesWon,
      isCurrentPlayer: true,
    });
  }

  return realEntries;
}

/**
 * Consulta o Ranking Semanal de pilotos.
 * O ciclo zera todo domingo às 00:00:00.
 * Considera apenas desafios concluídos dentro da semana vigente (domingo 00h até o próximo domingo 00h).
 */
export async function getWeeklyLeaderboard(referenceDate?: Date): Promise<WeeklyLeaderboardEntry[]> {
  const profile = getOrCreatePlayerProfile();
  const { startOfWeek, endOfWeek } = getCurrentWeekRange(referenceDate);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_results')
        .select(`
          player_id,
          score,
          attempts_count,
          won,
          completed_at,
          players (
            nickname
          )
        `)
        .gte('completed_at', startOfWeek.toISOString())
        .lt('completed_at', endOfWeek.toISOString());

      if (!error && data && data.length > 0) {
        const playerMap = new Map<string, {
          playerId: string;
          nickname: string;
          totalScore: number;
          gamesPlayed: number;
          gamesWon: number;
          bestAttempts: number;
          isCurrentPlayer: boolean;
        }>();

        data.forEach((item: any) => {
          const pId = item.player_id;
          const nick = item.players?.nickname || 'Piloto Anônimo';
          const existing = playerMap.get(pId) || {
            playerId: pId,
            nickname: nick,
            totalScore: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            bestAttempts: 6,
            isCurrentPlayer: pId === profile.id,
          };

          existing.totalScore += item.score || 0;
          existing.gamesPlayed += 1;
          if (item.won) existing.gamesWon += 1;
          if (item.attempts_count && item.attempts_count < existing.bestAttempts) {
            existing.bestAttempts = item.attempts_count;
          }
          if (pId === profile.id) {
            existing.nickname = profile.nickname;
          }

          playerMap.set(pId, existing);
        });

        const list = Array.from(playerMap.values());
        list.sort((a, b) => {
          if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
          if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
          return a.bestAttempts - b.bestAttempts;
        });

        return list.slice(0, 50).map((item, index) => ({
          rank: index + 1,
          playerId: item.playerId,
          nickname: item.nickname,
          totalScore: item.totalScore,
          gamesPlayed: item.gamesPlayed,
          gamesWon: item.gamesWon,
          isCurrentPlayer: item.isCurrentPlayer,
        }));
      }
    } catch (err) {
      console.warn('Falha na consulta remota de ranking semanal, usando fallback local:', err);
    }
  }

  // Fallback Local: calcula a partir dos resultados salvos dentro da semana vigente
  const store = getLocalLeaderboardStore();
  let localTotalScore = 0;
  let localGamesPlayed = 0;
  let localGamesWon = 0;

  Object.values(store).forEach((list) => {
    const mine = list.find((e) => e.playerId === profile.id);
    if (mine) {
      let isWithinWeek = false;
      if (mine.completedAtIso) {
        const d = new Date(mine.completedAtIso);
        isWithinWeek = d >= startOfWeek && d < endOfWeek;
      } else {
        // Registros sem timestamp explícito são considerados da semana corrente
        isWithinWeek = true;
      }

      if (isWithinWeek) {
        localTotalScore += mine.score;
        localGamesPlayed += 1;
        if (mine.won) localGamesWon += 1;
      }
    }
  });

  const weeklyEntries: WeeklyLeaderboardEntry[] = [];
  if (localGamesPlayed > 0) {
    weeklyEntries.push({
      rank: 1,
      playerId: profile.id,
      nickname: profile.nickname,
      totalScore: localTotalScore,
      gamesPlayed: localGamesPlayed,
      gamesWon: localGamesWon,
      isCurrentPlayer: true,
    });
  }

  return weeklyEntries;
}
