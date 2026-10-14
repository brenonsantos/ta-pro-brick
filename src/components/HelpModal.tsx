import { X, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Primeira vez aqui?</span>
              <h2 className="text-base font-extrabold text-white">Como Jogar o Tá pro Brick</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-zinc-300 leading-relaxed">
          <div>
            <h3 className="font-bold text-amber-400 uppercase tracking-wide text-[11px]">
              1. O Objetivo
            </h3>
            <p className="mt-1">
              Adivinhe o <strong>preço pedido pelo anunciante</strong> em um anúncio real de carro usado. Atenção: não é a tabela FIPE nem o valor justo de mercado, é exatamente o que o dono pediu!
            </p>
          </div>

          <div>
            <h3 className="font-bold text-amber-400 uppercase tracking-wide text-[11px]">
              2. As 6 Tentativas & Pistas
            </h3>
            <p className="mt-1">
              A cada palpite confirmado, novas informações do anúncio são liberadas (fotos extras, descrição, cidade e tempo de publicação). Na 6ª tentativa não há novas pistas: é seu chute final com todo o contexto acumulado.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-amber-400 uppercase tracking-wide text-[11px]">
              3. Faixas de Calor & Direção
            </h3>
            <p className="mt-1">
              Após cada chute, o jogo avisa se o valor real é <strong>maior (▲)</strong> ou <strong>menor (▼)</strong> e colore o cartão:
            </p>
            <ul className="mt-2 space-y-1.5 pl-1">
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <span><strong>Frio:</strong> erro maior que 50%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span><strong>Morno:</strong> erro entre 20% e 50%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span><strong>Quente:</strong> erro entre 5% e 20%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span><strong>Vitória:</strong> dentro de 5% (ou R$ 1.000)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-500" />
                <span><strong>Na Mosca / Cravou:</strong> dentro de 1% ou valor exato</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-amber-400 uppercase tracking-wide text-[11px]">
              4. Dilema de Risco
            </h3>
            <p className="mt-1">
              Ao acertar dentro dos 5%, você já venceu! Você pode <strong>encerrar</strong> para garantir o bônus de <strong>+500 pts por tentativa restante</strong>, ou <strong>continuar arriscando</strong> para tentar cravar o valor exato no topo do ranking.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-amber-500 py-3.5 text-sm font-extrabold uppercase tracking-wide text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.98] transition"
        >
          Entendi, vamos jogar! 🚀
        </button>
      </div>
    </div>
  );
};
