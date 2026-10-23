import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockIsConfigured = true;
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('../supabase', () => ({
  isSupabaseConfigured: () => mockIsConfigured,
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        remove: vi.fn(),
      }),
    },
  },
}));

import {
  isExternalPhotoUrl,
  uploadPhotoFromUrl,
  transferExternalPhotosToStorage,
} from '../storageService';

describe('storageService - External Photo Helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockIsConfigured = true;
    mockUpload.mockReset();
    mockGetPublicUrl.mockReset();
  });

  describe('isExternalPhotoUrl', () => {
    it('returns false for local relative paths', () => {
      expect(isExternalPhotoUrl('/cars/gol-1988/1.jpg')).toBe(false);
      expect(isExternalPhotoUrl('/logo.png')).toBe(false);
    });

    it('returns false for Supabase Storage URLs', () => {
      expect(
        isExternalPhotoUrl(
          'https://abcd.supabase.co/storage/v1/object/public/challenges/cars/car-12345.jpg'
        )
      ).toBe(false);
    });

    it('returns true for Facebook CDN URLs and other external links', () => {
      expect(
        isExternalPhotoUrl(
          'https://scontent.fjoi2-1.fna.fbcdn.net/v/t39.84726-6/photo.jpg?token=123'
        )
      ).toBe(true);
      expect(isExternalPhotoUrl('https://images.unsplash.com/photo-123')).toBe(true);
      expect(isExternalPhotoUrl('http://meusite.com/carro.jpg')).toBe(true);
    });

    it('returns false for empty or invalid values', () => {
      expect(isExternalPhotoUrl('')).toBe(false);
      expect(isExternalPhotoUrl('   ')).toBe(false);
      expect(isExternalPhotoUrl(null as any)).toBe(false);
      expect(isExternalPhotoUrl(undefined as any)).toBe(false);
    });
  });

  describe('uploadPhotoFromUrl', () => {
    it('returns error when Supabase is not configured', async () => {
      mockIsConfigured = false;

      const result = await uploadPhotoFromUrl('https://scontent.fbcdn.net/car.jpg');
      expect(result.error).toContain('Supabase Storage não está configurado');
      expect(result.url).toBeUndefined();
    });

    it('downloads image blob and uploads successfully to Supabase Storage', async () => {
      mockIsConfigured = true;
      mockUpload.mockResolvedValue({
        data: { path: 'cars/corsa-123.jpg' },
        error: null,
      });
      mockGetPublicUrl.mockReturnValue({
        data: {
          publicUrl:
            'https://test.supabase.co/storage/v1/object/public/challenges/cars/corsa-123.jpg',
        },
      });

      const mockBlob = new Blob(['mock-binary-image-data'], { type: 'image/jpeg' });
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'image/jpeg' }),
        blob: vi.fn().mockResolvedValue(mockBlob),
      });
      global.fetch = mockFetch;

      const result = await uploadPhotoFromUrl(
        'https://scontent.fbcdn.net/carro.jpg?token=fresh',
        'corsa'
      );

      expect(mockFetch).toHaveBeenCalledWith('https://scontent.fbcdn.net/carro.jpg?token=fresh');
      expect(mockUpload).toHaveBeenCalled();
      expect(result.url).toBe(
        'https://test.supabase.co/storage/v1/object/public/challenges/cars/corsa-123.jpg'
      );
      expect(result.error).toBeUndefined();
    });

    it('returns error if fetch returns 403 or non-ok status', async () => {
      mockIsConfigured = true;

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const result = await uploadPhotoFromUrl('https://scontent.fbcdn.net/expired.jpg');
      expect(result.error).toContain('403 Forbidden');
      expect(result.url).toBeUndefined();
    });
  });

  describe('transferExternalPhotosToStorage', () => {
    it('skips already internal/supabase URLs and uploads external ones', async () => {
      mockIsConfigured = true;
      mockUpload.mockResolvedValue({
        data: { path: 'cars/rehosted.jpg' },
        error: null,
      });
      mockGetPublicUrl.mockReturnValue({
        data: {
          publicUrl:
            'https://test.supabase.co/storage/v1/object/public/challenges/cars/rehosted.jpg',
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'image/jpeg' }),
        blob: vi.fn().mockResolvedValue(new Blob(['img'])),
      });

      const photoUrls = [
        '/cars/local.jpg',
        'https://scontent.fbcdn.net/fb-photo-1.jpg',
        'https://test.supabase.co/storage/v1/object/public/challenges/cars/already-supabase.jpg',
      ];

      const progressSpy = vi.fn();
      const res = await transferExternalPhotosToStorage(photoUrls, 'fusca', progressSpy);

      expect(res.transferredCount).toBe(1);
      expect(res.failedCount).toBe(0);
      expect(res.updatedUrls).toEqual([
        '/cars/local.jpg',
        'https://test.supabase.co/storage/v1/object/public/challenges/cars/rehosted.jpg',
        'https://test.supabase.co/storage/v1/object/public/challenges/cars/already-supabase.jpg',
      ]);
      expect(progressSpy).toHaveBeenCalledWith(2, 3);
    });

    it('keeps original URL and reports error when external image transfer fails', async () => {
      mockIsConfigured = true;

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const photoUrls = ['https://scontent.fbcdn.net/expired-photo.jpg'];
      const res = await transferExternalPhotosToStorage(photoUrls, 'corsa');

      expect(res.transferredCount).toBe(0);
      expect(res.failedCount).toBe(1);
      expect(res.updatedUrls).toEqual(['https://scontent.fbcdn.net/expired-photo.jpg']);
      expect(res.errors.length).toBe(1);
      expect(res.errors[0]).toContain('403 Forbidden');
    });
  });
});
