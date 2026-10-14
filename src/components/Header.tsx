import React from 'react';
import { HelpCircle, Car } from 'lucide-react';

interface HeaderProps {
  currentAttempt: number;
  maxAttempts: number;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAttempt,
  maxAttempts,
  onOpenHelp,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 font-black text-zinc-950 shadow-md shadow-amber-500/20">
          <Car className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-white">
            Tá pro <span className="text-amber-400">Brick</span>
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            Protótipo • Desafio Diário
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
          Tentativa{' '}
          <span className="font-bold text-amber-400">
            {Math.min(currentAttempt, maxAttempts)}
          </span>
          /{maxAttempts}
        </div>

        <button
          onClick={onOpenHelp}
          className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          title="Como jogar"
          aria-label="Como jogar"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
