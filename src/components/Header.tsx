import { HelpCircle, Car, BarChart2 } from 'lucide-react';

interface HeaderProps {
  currentAttempt: number;
  maxAttempts: number;
  onOpenHelp: () => void;
  onOpenStats?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAttempt,
  maxAttempts,
  onOpenHelp,
  onOpenStats,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 sm:px-8 py-3.5 sm:py-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-amber-500 font-black text-zinc-950 shadow-md shadow-amber-500/20">
          <Car className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Tá pro <span className="text-amber-400">Brick</span>
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Desafio Diário
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-zinc-300">
          Tentativa{' '}
          <span className="font-bold text-amber-400">
            {Math.min(currentAttempt, maxAttempts)}
          </span>
          /{maxAttempts}
        </div>

        <button
          onClick={onOpenStats}
          className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Estatísticas"
          aria-label="Estatísticas"
        >
          <BarChart2 className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          onClick={onOpenHelp}
          className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          title="Como jogar"
          aria-label="Como jogar"
        >
          <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </header>
  );
};
