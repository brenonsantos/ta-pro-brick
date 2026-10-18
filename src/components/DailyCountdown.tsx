import React, { useState, useEffect } from 'react';
import { Clock, Car, Share2, Check, ExternalLink, Trophy, AlertTriangle } from 'lucide-react';
import { getTimeUntilMidnight, MidnightCountdown } from '../utils/dailyChallenge';
import { ScoreBreakdown } from '../utils/gameLogic';
import { formatBRL } from '../utils/currency';

interface DailyCountdownProps {
  dayNumber: number;
  onSwitchToTraining?: () => void;
  onShareResult?: () => void;
  onOpenResult?: () => void;
  isCopied?: boolean;
  scoreBreakdown?: ScoreBreakdown;
  askingPrice?: number;
  originalUrl?: string;
  attemptsUsed?: number;
  maxAttempts?: number;
}

export const DailyCountdown: React.FC<DailyCountdownProps> = ({
  dayNumber,
  onSwitchToTraining,
  onShareResult,
  onOpenResult,
  isCopied,
  scoreBreakdown,
  askingPrice,
  originalUrl,
  attemptsUsed,
  maxAttempts = 5,
}) => {
  const [countdown, setCountdown] = useState<MidnightCountdown>(() => getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isWin = scoreBreakdown?.bestGuess?.isWin ?? false;
  const bestGuess = scoreBreakdown?.bestGuess;

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-zinc-950/70 to-zinc-950 p-5 sm:p-6 text-center shadow-xl backdrop-blur-md animate-in fade-in duration-300 space-y-4">
      {/* Header Status */}
      <div>
        <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
          {isWin ? (
            <Trophy className="h-6 w-6 text-amber-400" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-rose-400" />
          )}
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
          Desafio Diário #{dayNumber} Concluído
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
          {isWin ? 'Você Acertou o Preço! 🎯' : 'Fim de Jogo! 🏁'}
        </h2>
      </div>

      {/* Compact Round Result Metrics */}
      {scoreBreakdown && askingPrice !== undefined && bestGuess && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3.5 sm:p-4 text-left space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* 1. Preço Real */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Preço Real
              </span>
              <div className="text-base sm:text-lg font-black text-emerald-400">
                {formatBRL(askingPrice)}
              </div>
              <p className="text-[10px] text-zinc-500">Valor do anúncio</p>
            </div>

            {/* 2. Melhor Chute */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Seu Melhor Chute
              </span>
              <div className="text-base sm:text-lg font-black text-white">
                {formatBRL(bestGuess.guessValue)}
              </div>
              <p className="text-[10px] text-zinc-400 truncate">
                {bestGuess.heatBand === 'exact' ? (
                  <span className="text-amber-400 font-bold">🎯 Na mosca!</span>
                ) : (
                  <span>
                    {bestGuess.guessValue > (askingPrice ?? 0) ? '+' : '-'}
                    {formatBRL(bestGuess.absoluteDifference)} ({(bestGuess.errorPercentage * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
            </div>

            {/* 3. Pontuação */}
            <div className="col-span-2 sm:col-span-1 space-y-0.5 border-t sm:border-t-0 border-zinc-800/80 pt-2 sm:pt-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Pontuação
              </span>
              <div className="text-base sm:text-lg font-black text-amber-400">
                {scoreBreakdown.totalScore.toLocaleString('pt-BR')} pts
              </div>
              <p className="text-[10px] text-zinc-500">
                {attemptsUsed ?? 1}/{maxAttempts} {attemptsUsed === 1 ? 'chute' : 'chutes'}
              </p>
            </div>
          </div>

          {/* Link para o anúncio original */}
          {originalUrl && (
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver Anúncio Original no Marketplace
              </a>
            </div>
          )}
        </div>
      )}

      {/* Next Challenge Countdown */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3 sm:p-3.5">
        <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          Próximo anúncio em:
        </p>
        <div className="mt-1 font-mono text-2xl sm:text-3xl font-black tracking-wider text-white">
          {countdown.formatted}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
        {onShareResult && (
          <button
            type="button"
            onClick={onShareResult}
            className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wide text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.98] transition cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                Resultado Copiado!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 stroke-[2.5]" />
                Compartilhar Resultado
              </>
            )}
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

      {/* Subtle link if user still wants to see the modal breakdown */}
      {onOpenResult && (
        <button
          type="button"
          onClick={onOpenResult}
          className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 underline cursor-pointer transition pt-1"
        >
          Ver detalhes completos de bônus e estatísticas
        </button>
      )}
    </div>
  );
};
