import { track } from '@vercel/analytics';

/**
 * Registra eventos analíticos no Vercel Web Analytics.
 * Falha silenciosamente em ambientes de desenvolvimento ou sem suporte.
 */
export function trackEvent(name: string, properties?: Record<string, string | number | boolean>): void {
  try {
    if (typeof window !== 'undefined') {
      track(name, properties);
    }
  } catch {
    // Silencioso em caso de ad-blockers ou SSR
  }
}
