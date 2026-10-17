import { supabase, isSupabaseConfigured } from './supabase';
import { Challenge } from '../types/game';
import mockChallengesData from '../data/mockChallenges.json';

export interface AdminChallengeInput {
  id?: string;
  publishDate: string; // YYYY-MM-DD
  title: string;
  price: number;
  photos: string[];
  description: string;
  location: string;
  timePosted: string;
  originalUrl?: string;
  authorizationNotes?: string;
}

const ADMIN_CHALLENGES_STORAGE_KEY = 'taprobrick_admin_custom_challenges';

function getLocalCustomChallenges(): AdminChallengeInput[] {
  try {
    const data = localStorage.getItem(ADMIN_CHALLENGES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomChallenges(challenges: AdminChallengeInput[]): void {
  try {
    localStorage.setItem(ADMIN_CHALLENGES_STORAGE_KEY, JSON.stringify(challenges));
  } catch {
    // Ignore error
  }
}

export async function fetchAllChallenges(): Promise<AdminChallengeInput[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('publish_date', { ascending: false });

      if (!error && data) {
        return data.map((c: any) => ({
          id: c.id,
          publishDate: c.publish_date,
          title: c.title,
          price: Number(c.price),
          photos: Array.isArray(c.photos) ? c.photos : [],
          description: c.description || '',
          location: c.location || '',
          timePosted: c.time_posted || '',
          originalUrl: c.source_url || '',
          authorizationNotes: c.authorization_notes || '',
        }));
      }
    } catch (err) {
      console.warn('Erro ao carregar desafios do Supabase:', err);
    }
  }

  // Fallback: junta mockChallengesData com custom challenges locais
  const localCustom = getLocalCustomChallenges();
  const mockFormatted: AdminChallengeInput[] = (mockChallengesData as Challenge[]).map((c, index) => {
    const d = new Date();
    d.setDate(d.getDate() - index);
    const dateStr = d.toISOString().split('T')[0];

    const cover = c.clues.find((cl) => cl.type === 'title_and_cover')?.content?.coverImageUrl;
    const gallery = c.clues.find((cl) => cl.type === 'gallery')?.content?.images || [];
    const desc = c.clues.find((cl) => cl.type === 'description')?.content?.description || '';
    const loc = c.clues.find((cl) => cl.type === 'location')?.content?.location;
    const locStr = loc ? `${loc.city}, ${loc.state}` : '';
    const time = c.clues.find((cl) => cl.type === 'time')?.content?.timeOnMarket || '';

    const allPhotos: string[] = [];
    if (cover) allPhotos.push(cover);
    gallery.forEach((g) => {
      if (g && !allPhotos.includes(g)) allPhotos.push(g);
    });

    return {
      id: c.id,
      publishDate: dateStr,
      title: c.title,
      price: c.askingPrice,
      photos: allPhotos,
      description: desc,
      location: locStr,
      timePosted: time,
      originalUrl: c.originalUrl,
      authorizationNotes: 'Autorizado / Mock inicial de testes',
    };
  });

  const merged = [...localCustom];
  mockFormatted.forEach((m) => {
    if (!merged.some((item) => item.id === m.id)) {
      merged.push(m);
    }
  });

  merged.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return merged;
}

export async function saveChallenge(input: AdminChallengeInput): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('challenges').upsert({
        id: input.id || undefined,
        publish_date: input.publishDate,
        title: input.title,
        price: input.price,
        photos: input.photos,
        description: input.description,
        location: input.location,
        time_posted: input.timePosted,
        source_url: input.originalUrl,
        authorization_notes: input.authorizationNotes,
        is_published: true,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao conectar ao Supabase' };
    }
  }

  // Fallback Local
  const localList = getLocalCustomChallenges();
  const challengeId = input.id || `custom_${Date.now()}`;
  const entry: AdminChallengeInput = { ...input, id: challengeId };

  const existingIdx = localList.findIndex((c) => c.id === challengeId || c.publishDate === input.publishDate);
  if (existingIdx !== -1) {
    localList[existingIdx] = entry;
  } else {
    localList.unshift(entry);
  }

  saveLocalCustomChallenges(localList);
  return { success: true };
}

export async function deleteChallenge(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('challenges').delete().eq('id', id);
      return true;
    } catch {
      return false;
    }
  }

  const localList = getLocalCustomChallenges().filter((c) => c.id !== id);
  saveLocalCustomChallenges(localList);
  return true;
}
