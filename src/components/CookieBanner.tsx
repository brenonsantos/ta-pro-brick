import React, { useState } from 'react';
import { Cookie, X, Check } from 'lucide-react';

interface CookieBannerProps {
  onOpenPrivacy?: () => void;
}

const COOKIE_STORAGE_KEY = 'taprobrick_cookie_consent';

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(() => {
    try {
      if (typeof window === 'undefined') return true;
      return localStorage.getItem(COOKIE_STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, 'true');
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Aviso de cookies e privacidade" className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 z-40 max-w-md animate-fade-in">
      <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-md">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
          <Cookie className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white">Privacidade & Cookies</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">
            Utilizamos armazenamento local e cookies para salvar seu progresso no jogo, streaks e preferências conforme a LGPD.
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-black text-black hover:bg-amber-400 transition cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              Entendi
            </button>

            {onOpenPrivacy && (
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-[11px] font-semibold text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Mais detalhes
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAccept}
          className="rounded-full p-1 text-zinc-500 hover:text-white transition cursor-pointer"
          aria-label="Dispensar aviso de cookies"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
