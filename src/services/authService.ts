import { supabase, isSupabaseConfigured } from './supabase';
import { Session, User } from '@supabase/supabase-js';

export interface AuthResult {
  session?: Session | null;
  user?: User | null;
  error?: string;
}

/**
 * Verifica se um usuário possui a flag de administrador (is_admin: true)
 * Checa tanto em app_metadata (protegido por SQL/Auth) quanto em user_metadata.
 */
export function isUserAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return Boolean(
    user.app_metadata?.is_admin === true ||
    user.user_metadata?.is_admin === true
  );
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
 * Realiza login de administrador no Supabase Auth via e-mail e senha.
 * Exige estritamente que o usuário tenha a flag is_admin: true.
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

    if (!isUserAdmin(data.user)) {
      await supabase.auth.signOut();
      return {
        error:
          'Acesso negado: Este e-mail não possui permissão de administrador. Adicione {"is_admin": true} no seu usuário no Supabase para acessar.',
      };
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
 * Inicia o fluxo de autenticação OAuth com o Google para o administrador.
 * Redireciona o navegador para o login da conta Google e retorna para /admin.
 */
export async function signInAdminWithGoogle(redirectTo?: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase não está configurado neste ambiente.' };
  }

  try {
    const defaultRedirect =
      typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || defaultRedirect,
      },
    });

    if (error) {
      return { error: translateAuthError(error.message) };
    }

    return {};
  } catch (err: any) {
    return { error: err.message || 'Erro ao iniciar autenticação com Google.' };
  }
}

export interface AdminSessionResult {
  session: Session | null;
  error?: string;
}

/**
 * Valida a sessão ativa atual no Supabase.
 * Se houver um usuário logado sem privilégios de admin, encerra a sessão
 * e retorna uma mensagem de erro explicativa.
 */
export async function validateAdminSession(): Promise<AdminSessionResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { session: null };
  }

  try {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;

    if (!user) {
      return { session: null };
    }

    if (!isUserAdmin(user)) {
      await supabase.auth.signOut();
      return {
        session: null,
        error: `Acesso negado: O e-mail (${user.email || 'usuário'}) não possui permissão de administrador. Adicione {"is_admin": true} no seu usuário no Supabase para acessar.`,
      };
    }

    return { session: data.session };
  } catch {
    return { session: null };
  }
}

/**
 * Obtém a sessão ativa de autenticação atual do navegador,
 * validando se o usuário possui a flag de administrador.
 */
export async function getAdminSession(): Promise<Session | null> {
  const result = await validateAdminSession();
  return result.session;
}

/**
 * Escuta mudanças de estado da sessão (login, logout, retorno de OAuth, renovação de token)
 */
export function subscribeToAuthChanges(
  callback: (session: Session | null, error?: string) => void
): { unsubscribe: () => void } {
  const client = supabase;
  if (!isSupabaseConfigured() || !client) {
    return { unsubscribe: () => {} };
  }

  const { data } = client.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      if (isUserAdmin(session.user)) {
        callback(session);
      } else {
        await client.auth.signOut();
        callback(
          null,
          `Acesso negado: O e-mail (${session.user.email || 'usuário'}) não possui permissão de administrador. Adicione {"is_admin": true} no seu usuário no Supabase para acessar.`
        );
      }
    } else {
      callback(null);
    }
  });

  return {
    unsubscribe: () => {
      data?.subscription?.unsubscribe();
    },
  };
}
