import { X, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] w-full max-w-md sm:max-w-xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
                Primeira vez aqui?
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Como Jogar Tá pro Brick
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <h3 className="font-extrabold text-amber-400 uppercase tracking-wide text-xs sm:text-sm">
              1. O Objetivo do Jogo
            </h3>
            <p className="mt-1.5 text-zinc-200">
              Adivinhe o <strong>preço pedido pelo anunciante</strong> em um anúncio real de carro usado.
            </p>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              ⚠️ <em>Atenção: não é o valor da tabela FIPE nem o que o carro vale de verdade. É o valor que o dono colocou no anúncio!</em>
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <h3 className="font-extrabold text-amber-400 uppercase tracking-wide text-xs sm:text-sm">
              2. As 6 Tentativas & Pistas Progressivas
            </h3>
            <p className="mt-1.5 text-zinc-200">
              A cada palpite confirmado, novas informações do anúncio são desbloqueadas:
            </p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-zinc-300">
              <div className="rounded-lg bg-zinc-950/80 p-2 border border-zinc-800">
                <strong>Palpite 1:</strong> Título + Foto de capa
              </div>
              <div className="rounded-lg bg-zinc-950/80 p-2 border border-zinc-800">
                <strong>Palpite 2:</strong> Galeria com fotos extras
              </div>
              <div className="rounded-lg bg-zinc-950/80 p-2 border border-zinc-800">
                <strong>Palpite 3:</strong> Descrição do vendedor
              </div>
              <div className="rounded-lg bg-zinc-950/80 p-2 border border-zinc-800">
                <strong>Palpite 4:</strong> Cidade e estado
              </div>
              <div className="rounded-lg bg-zinc-950/80 p-2 border border-zinc-800 sm:col-span-2">
                <strong>Palpite 5:</strong> Tempo de anúncio • <strong>Palpite 6:</strong> Chute final!
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <h3 className="font-extrabold text-amber-400 uppercase tracking-wide text-xs sm:text-sm">
              3. Faixas de Calor & Direção
            </h3>
            <p className="mt-1.5 text-zinc-200">
              Após cada chute, o jogo avisa se o valor real é <strong>maior (▲)</strong> ou <strong>menor (▼)</strong> e colore o cartão:
            </p>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm">
              <li className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-blue-500 shrink-0 shadow-sm shadow-blue-500/50" />
                <span><strong className="text-blue-300">Frio (Azul):</strong> erro maior que 50%</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-yellow-500 shrink-0 shadow-sm shadow-yellow-500/50" />
                <span><strong className="text-yellow-300">Morno (Amarelo):</strong> erro entre 20% e 50%</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-amber-500 shrink-0 shadow-sm shadow-amber-500/50" />
                <span><strong className="text-amber-300">Muito Perto (Laranja):</strong> erro entre 5% e 20%</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
                <span><strong className="text-emerald-300">Vitória (Verde):</strong> dentro de 5% (ou R$ 1.000)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-purple-500 shrink-0 shadow-sm shadow-purple-500/50" />
                <span><strong className="text-purple-300">Na Mosca / Cravou (Roxo):</strong> dentro de 1% ou valor exato</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <h3 className="font-extrabold text-amber-400 uppercase tracking-wide text-xs sm:text-sm">
              4. Dilema de Risco
            </h3>
            <p className="mt-1.5 text-zinc-200">
              Ao acertar dentro dos 5%, você já garantiu a vitória! Você pode <strong>encerrar</strong> para garantir o bônus de <strong>+500 pts por tentativa não gasta</strong>, ou <strong>arriscar seus palpites restantes</strong> para tentar cravar o valor exato no topo do ranking.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-amber-500 py-4 text-base sm:text-lg font-black uppercase tracking-wide text-zinc-950 shadow-xl shadow-amber-500/25 hover:bg-amber-400 active:scale-[0.98] transition cursor-pointer"
        >
          Entendi, vamos jogar! 🚀
        </button>
      </div>
    </div>
  );
};
