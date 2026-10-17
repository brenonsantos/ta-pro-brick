import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET_NAME = 'challenges';

export interface UploadPhotoResult {
  url?: string;
  error?: string;
}

/**
 * Sanitiza o nome de arquivo para evitar caracteres especiais no path do Storage
 */
function sanitizeFileName(fileName: string): string {
  const extension = fileName.split('.').pop() || 'jpg';
  const cleanBase = fileName
    .replace(/\.[^/.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  return `${cleanBase}-${Date.now()}.${extension}`;
}

/**
 * Faz upload de uma foto individual para o bucket de desafios do Supabase Storage
 */
export async function uploadChallengePhoto(
  file: File | Blob,
  fileName?: string
): Promise<UploadPhotoResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase Storage não está configurado.' };
  }

  try {
    const rawName = fileName || (file instanceof File ? file.name : `photo-${Date.now()}.jpg`);
    const finalFileName = sanitizeFileName(rawName);
    const filePath = `cars/${finalFileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 ano de cache para assets estáticos
        upsert: true,
      });

    if (error) {
      console.error('Erro ao fazer upload no Supabase Storage:', error);
      return { error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error('Falha de rede ao fazer upload:', err);
    return { error: err.message || 'Erro inesperado no upload' };
  }
}

/**
 * Faz upload de múltiplas fotos em lote, com feedback de progresso
 */
export async function uploadMultiplePhotos(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const res = await uploadChallengePhoto(file);
    if (res.url) {
      urls.push(res.url);
    } else if (res.error) {
      errors.push(`${file.name}: ${res.error}`);
    }
    onProgress?.(i + 1, files.length);
  }

  return { urls, errors };
}

/**
 * Remove uma foto do bucket do Supabase a partir de sua URL pública
 */
export async function deleteChallengePhoto(photoUrl: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    // Extrai o caminho relativo dentro do bucket a partir da URL pública
    const marker = `${BUCKET_NAME}/`;
    const markerIndex = photoUrl.indexOf(marker);
    if (markerIndex === -1) return false;

    const path = photoUrl.substring(markerIndex + marker.length);
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
    return !error;
  } catch {
    return false;
  }
}
