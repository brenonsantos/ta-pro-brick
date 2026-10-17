import { supabase, isSupabaseConfigured } from './supabase';

export interface PlayerProfile {
  id: string;
  authId?: string | null;
  nickname: string;
  isAnonymous: boolean;
  avatarUrl?: string | null;
}

const PLAYER_STORAGE_KEY = 'taprobrick_player_profile';

const FUN_NICKNAMES = [
  'Piloto do Opala',
  'Piloto do Gol GTS',
  'Piloto do Uno com Escada',
  'Piloto Turbo',
  'Piloto do Chevette',
  'Piloto da F-1000',
  'Piloto V8',
  'Piloto da Caravan',
  'Piloto de Milha',
  'Piloto de Pista',
];

export function generateRandomNickname(): string {
  const prefix = FUN_NICKNAMES[Math.floor(Math.random() * FUN_NICKNAMES.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix} #${num}`;
}

export function getOrCreatePlayerProfile(): PlayerProfile {
  try {
    const saved = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.id && parsed.nickname) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }

  const newProfile: PlayerProfile = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `player_${Date.now()}_${Math.random()}`,
    nickname: generateRandomNickname(),
    isAnonymous: true,
  };

  try {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(newProfile));
  } catch {
    // Ignore error
  }

  // Se Supabase estiver conectado, salvar no banco em background
  if (isSupabaseConfigured() && supabase) {
    supabase
      .from('players')
      .upsert({
        id: newProfile.id,
        nickname: newProfile.nickname,
        is_anonymous: true,
        updated_at: new Date().toISOString(),
      })
      .then(() => {});
  }

  return newProfile;
}

export async function updatePlayerNickname(newNickname: string): Promise<PlayerProfile> {
  const current = getOrCreatePlayerProfile();
  const trimmed = newNickname.trim().slice(0, 30);
  if (!trimmed) return current;

  const updated: PlayerProfile = {
    ...current,
    nickname: trimmed,
  };

  try {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore error
  }

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('players').upsert({
      id: updated.id,
      nickname: updated.nickname,
      is_anonymous: updated.isAnonymous,
      updated_at: new Date().toISOString(),
    });
  }

  return updated;
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase não configurado neste ambiente.' };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    return { error: error.message };
  }
  return {};
}

export async function signOutPlayer(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  }
}
