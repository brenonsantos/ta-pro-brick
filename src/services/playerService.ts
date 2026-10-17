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

export async function syncPlayerProfileToSupabase(profile: PlayerProfile): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('players')
        .upsert(
          {
            id: profile.id,
            auth_id: profile.authId || null,
            nickname: profile.nickname,
            is_anonymous: profile.isAnonymous,
            avatar_url: profile.avatarUrl || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      if (error) {
        console.warn('Aviso ao sincronizar perfil com Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Falha de rede ao sincronizar perfil:', err);
    }
  }
}

export function getOrCreatePlayerProfile(): PlayerProfile {
  try {
    const saved = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.id && parsed.nickname) {
        // Garante sincronização em background para perfis existentes
        syncPlayerProfileToSupabase(parsed);
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

  syncPlayerProfileToSupabase(newProfile);

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
    await supabase.from('players').upsert(
      {
        id: updated.id,
        nickname: updated.nickname,
        is_anonymous: updated.isAnonymous,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
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

export async function signOutPlayer(): Promise<PlayerProfile> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
  }
  const current = getOrCreatePlayerProfile();
  const resetProfile: PlayerProfile = {
    ...current,
    authId: null,
    isAnonymous: true,
    avatarUrl: null,
  };
  try {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(resetProfile));
  } catch {
    // Ignore
  }
  return resetProfile;
}

export function initAuthListener(onProfileChange?: (profile: PlayerProfile) => void): () => void {
  if (!isSupabaseConfigured() || !supabase) {
    return () => {};
  }

  const client = supabase;

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      let current = getOrCreatePlayerProfile();
      try {
        const { data: existingPlayer } = await client
          .from('players')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle();

        if (existingPlayer) {
          current = {
            id: existingPlayer.id,
            authId: existingPlayer.auth_id,
            nickname: existingPlayer.nickname || current.nickname,
            isAnonymous: false,
            avatarUrl: existingPlayer.avatar_url || session.user.user_metadata?.avatar_url || null,
          };
        } else {
          current = {
            ...current,
            authId: session.user.id,
            isAnonymous: false,
            avatarUrl: session.user.user_metadata?.avatar_url || null,
          };
        }

        try {
          localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(current));
        } catch {
          // Ignore
        }

        await client.from('players').upsert(
          {
            id: current.id,
            auth_id: current.authId,
            nickname: current.nickname,
            is_anonymous: false,
            avatar_url: current.avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        onProfileChange?.(current);
      } catch (err) {
        console.warn('Erro ao processar login com Google:', err);
      }
    } else if (event === 'SIGNED_OUT') {
      const current = getOrCreatePlayerProfile();
      const reset: PlayerProfile = {
        ...current,
        authId: null,
        isAnonymous: true,
        avatarUrl: null,
      };
      try {
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(reset));
      } catch {
        // Ignore
      }
      onProfileChange?.(reset);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
