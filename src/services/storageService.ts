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

/**
 * Verifica se uma URL é externa (ex: Facebook CDN, Imgur, etc.) e precisa ser migrada para o Supabase Storage
 */
export function isExternalPhotoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Se for caminho relativo (/cars/...) ou já for do Supabase Storage, não é externa
  if (trimmed.startsWith('/') || trimmed.includes('/storage/v1/object/public/challenges/')) {
    return false;
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Baixa uma imagem via fetch() e faz upload diretamente para o Supabase Storage
 */
export async function uploadPhotoFromUrl(
  imageUrl: string,
  fileNamePrefix: string = 'car'
): Promise<UploadPhotoResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase Storage não está configurado.' };
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return { error: `Falha ao baixar imagem (${response.status} ${response.statusText})` };
    }

    const blob = await response.blob();
    // Determina extensão a partir do Content-Type ou URL
    const contentType = response.headers.get('content-type') || blob.type || '';
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';

    const cleanPrefix = fileNamePrefix
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');

    const fileName = `${cleanPrefix}-${Date.now()}.${ext}`;
    return await uploadChallengePhoto(blob, fileName);
  } catch (err: any) {
    console.error(`Erro ao transferir imagem da URL ${imageUrl}:`, err);
    return { error: err.message || 'Erro de rede ao baixar a imagem' };
  }
}

export interface TransferPhotosResult {
  updatedUrls: string[];
  transferredCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * Migra em lote uma lista de URLs externas para o Supabase Storage
 */
export async function transferExternalPhotosToStorage(
  photoUrls: string[],
  titlePrefix: string = 'car',
  onProgress?: (current: number, total: number) => void
): Promise<TransferPhotosResult> {
  const updatedUrls: string[] = [];
  const errors: string[] = [];
  let transferredCount = 0;
  let failedCount = 0;

  for (let i = 0; i < photoUrls.length; i++) {
    const originalUrl = photoUrls[i].trim();
    if (!originalUrl) continue;

    if (isExternalPhotoUrl(originalUrl)) {
      onProgress?.(i + 1, photoUrls.length);
      const res = await uploadPhotoFromUrl(originalUrl, `${titlePrefix}-${i + 1}`);
      if (res.url) {
        updatedUrls.push(res.url);
        transferredCount++;
      } else {
        // Se falhou (ex: 403 ou CORS), mantém a URL original para não perder a referência e reporta o erro
        updatedUrls.push(originalUrl);
        failedCount++;
        errors.push(`Foto #${i + 1}: ${res.error || 'Falha no download/upload'}`);
      }
    } else {
      // Já é interna ou do Supabase
      updatedUrls.push(originalUrl);
    }
  }

  return { updatedUrls, transferredCount, failedCount, errors };
}

