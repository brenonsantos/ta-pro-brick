import { supabase, isSupabaseConfigured } from './supabase';
import { Challenge } from '../types/game';
import mockChallengesData from '../data/mockChallenges.json';

export const defaultChallenges: Challenge[] = mockChallengesData as Challenge[];
export const CACHED_CHALLENGES_KEY = 'taprobrick_cached_challenges_v1';

/**
 * Retorna os desafios persistidos em cache no navegador, se houverem
 */
export function getCachedChallenges(): Challenge[] | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CACHED_CHALLENGES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao ler cache de desafios:', err);
  }
  return null;
}

/**
 * Salva a lista de desafios no cache local para carregamento instantâneo
 */
export function saveCachedChallenges(challenges: Challenge[]): void {
  try {
    if (typeof localStorage !== 'undefined' && Array.isArray(challenges) && challenges.length > 0) {
      localStorage.setItem(CACHED_CHALLENGES_KEY, JSON.stringify(challenges));
    }
  } catch (err) {
    console.warn('Erro ao salvar cache de desafios:', err);
  }
}

/**
 * Retorna os desafios para inicialização síncrona do componente:
 * 1. Se houver cache no localStorage, usa imediatamente (elimina piscada do carro local).
 * 2. Se Supabase não estiver configurado (ex: offline ou dev local sem .env), usa defaultChallenges.
 * 3. Se Supabase estiver configurado e o cache estiver vazio (primeiro acesso), retorna array vazio
 *    para permitir que a interface exiba um skeleton suave enquanto busca os dados reais da nuvem.
 */
export function getInitialChallenges(): Challenge[] {
  const cached = getCachedChallenges();
  if (cached && cached.length > 0) {
    return cached;
  }

  if (!isSupabaseConfigured()) {
    return defaultChallenges;
  }

  return [];
}

/**
 * Converte um registro do banco de dados na estrutura Challenge utilizada pelo jogo
 */
export function mapRowToChallenge(row: any): Challenge {
  const photos: string[] = Array.isArray(row.photos) ? row.photos : [];
  const coverImageUrl = photos[0] || '';
  const galleryImages = photos.length > 1 ? photos.slice(1) : (photos.length > 0 ? photos : []);

  const [city = 'Brasil', state = ''] = (row.location || '').split(',').map((s: string) => s.trim());

  return {
    id: String(row.id),
    title: row.title,
    shortName: row.title.split(' ').slice(0, 3).join(' '),
    askingPrice: Number(row.price),
    originalUrl: row.source_url || undefined,
    publishDate: row.publish_date || undefined,
    clues: [
      {
        id: 1,
        attemptNumber: 1,
        label: 'Título e Foto de Capa',
        type: 'title_and_cover',
        content: {
          title: row.title,
          coverImageUrl,
        },
      },
      {
        id: 2,
        attemptNumber: 2,
        label: 'Galeria de Fotos',
        type: 'gallery',
        content: {
          images: galleryImages,
        },
      },
      {
        id: 3,
        attemptNumber: 3,
        label: 'Descrição do Anúncio',
        type: 'description',
        content: {
          description: row.description || '',
        },
      },
      {
        id: 4,
        attemptNumber: 4,
        label: 'Localização do Veículo',
        type: 'location',
        content: {
          location: {
            city: city || 'Brasil',
            state: state || '',
          },
        },
      },
      {
        id: 5,
        attemptNumber: 5,
        label: 'Tempo de Anúncio',
        type: 'time',
        content: {
          timeOnMarket: row.time_posted || 'Publicado recentemente',
        },
      },
    ],
  };
}

/**
 * Busca o desafio agendado para uma data específica no Supabase
 */
export async function getChallengeForDate(dateStr: string): Promise<Challenge | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('publish_date', dateStr)
        .eq('is_published', true)
        .maybeSingle();

      if (!error && data) {
        return mapRowToChallenge(data);
      }
    } catch (err) {
      console.warn('Erro ao consultar desafio por data no Supabase:', err);
    }
  }
  return null;
}

/**
 * Busca todos os desafios publicados no Supabase, mantendo os mockChallenges como fallback seguro
 */
export async function loadActiveChallenges(): Promise<Challenge[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_published', true)
        .order('publish_date', { ascending: true });

      if (!error && data && data.length > 0) {
        const fromDb = data.map(mapRowToChallenge);
        saveCachedChallenges(fromDb);
        return fromDb;
      }
    } catch (err) {
      console.warn('Erro ao carregar lista de desafios do Supabase:', err);
    }
  }

  const cached = getCachedChallenges();
  if (cached && cached.length > 0) {
    return cached;
  }

  return defaultChallenges;
}
