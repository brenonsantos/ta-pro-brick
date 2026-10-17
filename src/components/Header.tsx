import { HelpCircle, Car, BarChart2, Flame, Trophy } from 'lucide-react';

interface HeaderProps {
  currentAttempt?: number;
  maxAttempts?: number;
  onOpenHelp: () => void;
  onOpenStats?: () => void;
  onOpenLeaderboard?: () => void;
  dayNumber?: number;
  gameMode?: 'daily' | 'training';
  onToggleGameMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenStats,
  onOpenLeaderboard,
  dayNumber,
  gameMode = 'daily',
  onToggleGameMode,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 sm:px-8 py-3.5 sm:py-4 backdrop-blur-md">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-amber-500 shadow-md shadow-amber-500/20 shrink-0 p-1 overflow-hidden">
          <img
            src="/logo.png"
            alt="Tá pro Brick"
            className="h-full w-full object-contain select-none transition-transform hover:scale-105"
          />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            Tá pro <span className="text-amber-400">Brick</span>
            {gameMode === 'training' && (
              <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30 uppercase">
                Treino
              </span>
            )}
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {gameMode === 'daily' ? `Desafio Diário #${dayNumber || 1}` : 'Modo Garagem'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleGameMode && (
          <button
            type="button"
            onClick={onToggleGameMode}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition cursor-pointer border ${
              gameMode === 'daily'
                ? 'border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-white hover:border-zinc-700'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
            title={gameMode === 'daily' ? 'Ir para Modo Treino' : 'Voltar ao Desafio Diário'}
          >
            {gameMode === 'daily' ? (
              <>
                <Car className="h-3.5 w-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Treino</span>
              </>
            ) : (
              <>
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Diário</span>
              </>
            )}
          </button>
        )}

        {onOpenLeaderboard && (
          <button
            onClick={onOpenLeaderboard}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 transition-colors cursor-pointer"
            title="Ranking de Pilotos"
            aria-label="Ranking"
          >
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

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
