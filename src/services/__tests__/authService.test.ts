import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockIsConfigured = true;
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('../supabase', () => ({
  isSupabaseConfigured: () => mockIsConfigured,
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
      getSession: (...args: any[]) => mockGetSession(...args),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
    },
  },
}));

import {
  signInAdmin,
  signOutAdmin,
  getAdminSession,
  subscribeToAuthChanges,
} from '../authService';

describe('authService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockIsConfigured = true;
    mockSignInWithPassword.mockReset();
    mockSignOut.mockReset();
    mockGetSession.mockReset();
    mockOnAuthStateChange.mockReset();
  });

  describe('signInAdmin', () => {
    it('retorna erro se o Supabase não estiver configurado', async () => {
      mockIsConfigured = false;
      const res = await signInAdmin('admin@taprobrick.com.br', 'senha123');
      expect(res.error).toContain('Supabase não está configurado');
      expect(res.session).toBeUndefined();
    });

    it('retorna sessão e usuário com sucesso em credenciais válidas', async () => {
      mockIsConfigured = true;
      mockSignInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'fake-jwt-token' },
          user: { id: 'admin-uuid', email: 'admin@taprobrick.com.br' },
        },
        error: null,
      });

      const res = await signInAdmin('admin@taprobrick.com.br', 'senha123');
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'admin@taprobrick.com.br',
        password: 'senha123',
      });
      expect(res.session?.access_token).toBe('fake-jwt-token');
      expect(res.user?.email).toBe('admin@taprobrick.com.br');
      expect(res.error).toBeUndefined();
    });

    it('traduz erros de credenciais inválidas para mensagem amigável em português', async () => {
      mockIsConfigured = true;
      mockSignInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
      });

      const res = await signInAdmin('admin@taprobrick.com.br', 'senha-errada');
      expect(res.error).toContain('E-mail ou senha incorretos');
    });
  });

  describe('signOutAdmin', () => {
    it('chama signOut no Supabase com sucesso', async () => {
      mockIsConfigured = true;
      mockSignOut.mockResolvedValue({ error: null });

      const res = await signOutAdmin();
      expect(mockSignOut).toHaveBeenCalled();
      expect(res.error).toBeUndefined();
    });
  });

  describe('getAdminSession', () => {
    it('retorna null se Supabase não estiver configurado', async () => {
      mockIsConfigured = false;
      const session = await getAdminSession();
      expect(session).toBeNull();
    });

    it('retorna a sessão ativa quando existente', async () => {
      mockIsConfigured = true;
      mockGetSession.mockResolvedValue({
        data: { session: { user: { email: 'admin@taprobrick.com.br' } } },
        error: null,
      });

      const session = await getAdminSession();
      expect(session?.user?.email).toBe('admin@taprobrick.com.br');
    });
  });

  describe('subscribeToAuthChanges', () => {
    it('registra listener e retorna função de unsubscribe', () => {
      mockIsConfigured = true;
      const mockUnsubscribe = vi.fn();
      mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const callback = vi.fn();
      const sub = subscribeToAuthChanges(callback);

      expect(mockOnAuthStateChange).toHaveBeenCalled();
      sub.unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
