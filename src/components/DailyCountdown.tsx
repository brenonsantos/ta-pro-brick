import React, { useState, useEffect } from 'react';
import { Clock, Car, Share2, Check, Trophy } from 'lucide-react';
import { getTimeUntilMidnight, MidnightCountdown } from '../utils/dailyChallenge';

interface DailyCountdownProps {
  onSwitchToTraining?: () => void;
  onShareResult?: () => void;
  onOpenResult?: () => void;
  isCopied?: boolean;
  dayNumber: number;
}

export const DailyCountdown: React.FC<DailyCountdownProps> = ({
  onSwitchToTraining,
  onShareResult,
  onOpenResult,
  isCopied,
  dayNumber,
}) => {
  const [countdown, setCountdown] = useState<MidnightCountdown>(() => getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-zinc-950/80 p-5 sm:p-6 text-center shadow-xl backdrop-blur-md animate-in fade-in duration-300">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
        <Clock className="h-5 w-5" />
      </div>

      <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
        Desafio Diário #{dayNumber} Concluído!
      </span>

      <div className="mt-2">
        <p className="text-xs text-zinc-400 font-medium">Próximo anúncio em:</p>
        <div className="mt-1 font-mono text-3xl sm:text-4xl font-black tracking-wider text-white">
          {countdown.formatted}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        {onShareResult && (
          <button
            type="button"
            onClick={onShareResult}
            className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wide text-zinc-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.98] transition cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                Resultado Copiado!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 stroke-[2.5]" />
                Compartilhar
              </>
            )}
          </button>
        )}

        {onOpenResult && (
          <button
            type="button"
            onClick={onOpenResult}
            className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-xs sm:text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          >
            <Trophy className="h-4 w-4 text-amber-400" />
            Ver Resultado
          </button>
        )}

        {onSwitchToTraining && (
          <button
            type="button"
            onClick={onSwitchToTraining}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-xs sm:text-sm font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
          >
            <Car className="h-4 w-4 text-amber-400" />
            Arquivo
          </button>
        )}
      </div>
    </div>
  );
};
