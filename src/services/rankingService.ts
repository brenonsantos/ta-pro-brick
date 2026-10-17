import { supabase, isSupabaseConfigured } from './supabase';
import { getOrCreatePlayerProfile } from './playerService';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  score: number;
  attemptsCount: number;
  won: boolean;
  isCurrentPlayer: boolean;
  completedAt: string;
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
  };

  const filtered = currentList.filter((e) => e.playerId !== profile.id);
  filtered.push(playerEntry);
  store[params.challengeId] = filtered;
  saveLocalLeaderboardStore(store);

  // 2. Se Supabase estiver conectado, gravar no banco
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('daily_results').upsert(
        {
          challenge_id: params.challengeId,
          player_id: profile.id,
          score: params.score,
          attempts_count: params.attemptsCount,
          best_guess: params.bestGuess,
          won: params.won,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'challenge_id,player_id' }
      );
    } catch (err) {
      console.warn('Erro ao sincronizar resultado com Supabase:', err);
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
