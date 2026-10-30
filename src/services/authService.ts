import { supabase, isSupabaseConfigured } from './supabase';
import { Session, User } from '@supabase/supabase-js';

export interface AuthResult {
  session?: Session | null;
  user?: User | null;
  error?: string;
}

/**
 * Traduz mensagens técnicas do Supabase Auth para português amigável
 */
function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (lower.includes('email not confirmed')) {
    return 'E-mail ainda não confirmado no Supabase.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Muitas tentativas de login consecutivas. Aguarde alguns minutos.';
  }
  return message || 'Falha na autenticação.';
}

/**
 * Realiza login de administrador no Supabase Auth via e-mail e senha
 */
export async function signInAdmin(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase não está configurado neste ambiente.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { error: translateAuthError(error.message) };
    }

    return { session: data.session, user: data.user };
  } catch (err: any) {
    return { error: err.message || 'Erro inesperado ao conectar ao servidor de autenticação.' };
  }
}

/**
 * Encerra a sessão ativa do administrador no Supabase
 */
export async function signOutAdmin(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {};
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Obtém a sessão ativa de autenticação atual do navegador
 */
export async function getAdminSession(): Promise<Session | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch {
    return null;
  }
}

/**
 * Escuta mudanças de estado da sessão (login, logout, renovação de token)
 */
export function subscribeToAuthChanges(callback: (session: Session | null) => void): { unsubscribe: () => void } {
  if (!isSupabaseConfigured() || !supabase) {
    return { unsubscribe: () => {} };
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return {
    unsubscribe: () => {
      data?.subscription?.unsubscribe();
    },
  };
}
