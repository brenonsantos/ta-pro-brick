import React from 'react';

interface AdBannerSlotProps {
  isCompleted: boolean;
  className?: string;
}

const ADSENSE_CLIENT_ID = (import.meta as any).env?.VITE_ADSENSE_CLIENT_ID;

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ isCompleted, className = '' }) => {
  // Regra fundamental de UX: Anúncios NUNCA devem atrapalhar o jogador enquanto ele estiver jogando a rodada
  if (!isCompleted) return null;

  return (
    <div className={`w-full overflow-hidden my-4 transition-all duration-500 animate-fade-in ${className}`}>
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">
          Espaço Patrocinado
        </span>
        <span className="text-[9px] text-zinc-600">Apoia o Tá pro Brick</span>
      </div>

      <div className="flex h-20 sm:h-24 w-full items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-2 text-center">
        {ADSENSE_CLIENT_ID ? (
          // Contêiner padrão Google AdSense
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-zinc-400">
              Anuncie sua marca automotiva ou autopeças aqui
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              Exibido de forma 100% não-intrusiva após as rodadas diárias
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
