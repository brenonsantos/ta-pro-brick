/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
const rawSupabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

// Sanitiza a URL caso o usuário tenha colado com /rest/v1 ou barras no final
const cleanSupabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof cleanSupabaseUrl === 'string' &&
    cleanSupabaseUrl.length > 0 &&
    typeof rawSupabaseAnonKey === 'string' &&
    rawSupabaseAnonKey.length > 0 &&
    !cleanSupabaseUrl.includes('seu-projeto')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(cleanSupabaseUrl, rawSupabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
