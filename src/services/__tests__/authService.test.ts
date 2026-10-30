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
  isUserAdmin,
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

  describe('isUserAdmin', () => {
    it('retorna true quando app_metadata ou user_metadata contiver is_admin: true', () => {
      expect(isUserAdmin({ app_metadata: { is_admin: true } } as any)).toBe(true);
      expect(isUserAdmin({ app_metadata: {}, user_metadata: { is_admin: true } } as any)).toBe(true);
    });

    it('retorna false quando is_admin não estiver presente ou for falso', () => {
      expect(isUserAdmin({ app_metadata: { is_admin: false } } as any)).toBe(false);
      expect(isUserAdmin({ app_metadata: {} } as any)).toBe(false);
      expect(isUserAdmin(null)).toBe(false);
      expect(isUserAdmin(undefined)).toBe(false);
    });
  });

  describe('signInAdmin', () => {
    it('retorna erro se o Supabase não estiver configurado', async () => {
      mockIsConfigured = false;
      const res = await signInAdmin('admin@taprobrick.com.br', 'senha123');
      expect(res.error).toContain('Supabase não está configurado');
      expect(res.session).toBeUndefined();
    });

    it('retorna sessão e usuário com sucesso para usuário com is_admin: true', async () => {
      mockIsConfigured = true;
      mockSignInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'fake-jwt-token' },
          user: {
            id: 'admin-uuid',
            email: 'admin@taprobrick.com.br',
            app_metadata: { is_admin: true },
          },
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

    it('rejeita login e faz signOut se o usuário autenticado não tiver is_admin: true', async () => {
      mockIsConfigured = true;
      mockSignInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'regular-user-token' },
          user: {
            id: 'user-uuid',
            email: 'jogador@exemplo.com',
            app_metadata: { is_admin: false },
          },
        },
        error: null,
      });

      const res = await signInAdmin('jogador@exemplo.com', 'senha123');
      expect(mockSignOut).toHaveBeenCalled();
      expect(res.error).toContain('não possui permissão de administrador');
      expect(res.session).toBeUndefined();
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

    it('retorna a sessão ativa apenas se o usuário for admin', async () => {
      mockIsConfigured = true;
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: {
              email: 'admin@taprobrick.com.br',
              app_metadata: { is_admin: true },
            },
          },
        },
        error: null,
      });

      const session = await getAdminSession();
      expect(session?.user?.email).toBe('admin@taprobrick.com.br');
    });

    it('retorna null se o usuário da sessão não tiver is_admin: true', async () => {
      mockIsConfigured = true;
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: {
              email: 'jogador@taprobrick.com.br',
              app_metadata: {},
            },
          },
        },
        error: null,
      });

      const session = await getAdminSession();
      expect(session).toBeNull();
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
