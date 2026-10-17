import { supabase, isSupabaseConfigured } from './supabase';
import { Challenge } from '../types/game';
import mockChallengesData from '../data/mockChallenges.json';

const defaultChallenges: Challenge[] = mockChallengesData as Challenge[];

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
        return fromDb;
      }
    } catch (err) {
      console.warn('Erro ao carregar lista de desafios do Supabase:', err);
    }
  }

  return defaultChallenges;
}
