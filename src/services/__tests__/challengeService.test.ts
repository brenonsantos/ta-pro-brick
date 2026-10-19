import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCachedChallenges,
  saveCachedChallenges,
  getInitialChallenges,
  loadActiveChallenges,
  defaultChallenges,
} from '../challengeService';
import { Challenge } from '../../types/game';

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, val: string) => storage.set(key, String(val)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
globalThis.localStorage = localStorageMock as any;

describe('challengeService Caching & Flash Elimination', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const mockCustomChallenge: Challenge = {
    id: 'db-challenge-999',
    title: 'Fusca Itamar 1993',
    askingPrice: 38000,
    clues: [],
  };

  it('salva e recupera desafios do cache no localStorage', () => {
    expect(getCachedChallenges()).toBeNull();

    saveCachedChallenges([mockCustomChallenge]);
    const cached = getCachedChallenges();

    expect(cached).not.toBeNull();
    expect(cached?.length).toBe(1);
    expect(cached?.[0].id).toBe('db-challenge-999');
    expect(cached?.[0].title).toBe('Fusca Itamar 1993');
  });

  it('getInitialChallenges retorna o cache imediatamente quando existente', () => {
    saveCachedChallenges([mockCustomChallenge]);

    const initial = getInitialChallenges();
    expect(initial.length).toBe(1);
    expect(initial[0].id).toBe('db-challenge-999');
  });

  it('getInitialChallenges retorna defaultChallenges se Supabase não estiver configurado e não houver cache', () => {
    // No ambiente de teste, isSupabaseConfigured() é false
    const initial = getInitialChallenges();
    expect(initial.length).toBe(defaultChallenges.length);
    expect(initial[0].id).toBe(defaultChallenges[0].id);
  });

  it('loadActiveChallenges retorna desafios do cache quando disponível', async () => {
    saveCachedChallenges([mockCustomChallenge]);

    const loaded = await loadActiveChallenges();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('db-challenge-999');
  });
});
