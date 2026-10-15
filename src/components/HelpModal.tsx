import React from 'react';
import { X, Target, Lightbulb, Flame } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] w-full max-w-sm sm:max-w-md overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-lg">
              🚗
            </span>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Como Jogar
              </h2>
              <p className="text-xs text-zinc-400">3 passos rápidos para começar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3 Quick Visual Steps */}
        <div className="mt-4 space-y-3">
          {/* Step 1 */}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                1. Chute o Preço do Anúncio
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5 leading-snug">
                É o valor que o dono pediu na vida real (não é tabela FIPE!).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                2. Pistas a Cada Tentativa
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5 leading-snug">
                A cada chute você libera novas fotos, descrição, cidade e detalhes.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                3. Dicas de Calor & Direção
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5 leading-snug">
                O jogo avisa se o dono pediu <strong className="text-emerald-400">mais (▲)</strong> ou <strong className="text-rose-400">menos (▼)</strong> e o quão quente você está.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-black uppercase tracking-wide text-zinc-950 shadow-xl shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.98] transition cursor-pointer"
        >
          Bora Jogar! 🚀
        </button>
      </div>
    </div>
  );
};
