import React, { useState } from 'react';
import { X, FileCode, Check, AlertCircle, Copy, Bookmark } from 'lucide-react';

import { FB_MARKETPLACE_BOOKMARKLET } from '../utils/bookmarklet';

interface ImportChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: {
    title?: string;
    price?: number;
    photos?: string[];
    description?: string;
    location?: string;
    timePosted?: string;
    originalUrl?: string;
    authorizationNotes?: string;
  }) => void;
}

export const ImportChallengeModal: React.FC<ImportChallengeModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    setErrorMessage('');
    const trimmed = jsonText.trim();
    if (!trimmed) {
      setErrorMessage('Cole o JSON do anúncio para importar.');
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('O conteúdo deve ser um objeto JSON válido.');
      }

      onImport(parsed);
      onClose();
    } catch (err: any) {
      setErrorMessage(`JSON inválido: ${err.message || 'Verifique o formato colado.'}`);
    }
  };

  const handleCopyBookmarklet = async () => {
    try {
      await navigator.clipboard.writeText(FB_MARKETPLACE_BOOKMARKLET);
      setCopiedBookmarklet(true);
      setTimeout(() => setCopiedBookmarklet(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = FB_MARKETPLACE_BOOKMARKLET;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedBookmarklet(true);
      setTimeout(() => setCopiedBookmarklet(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">Importar Dados do Anúncio</h2>
              <p className="text-xs text-zinc-400">Preencha o formulário em 1 clique via JSON</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              Cole o JSON exportado pelo script extrator:
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={7}
              placeholder={`{\n  "title": "Jeep Renegade Longitude 2023",\n  "price": 91990,\n  "location": "Curitiba, PR",\n  "photos": ["https://..."],\n  "description": "Carro novo..."\n}`}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 p-3 text-xs font-mono text-zinc-200 focus:border-amber-500 focus:outline-none placeholder-zinc-600"
              autoFocus
            />
            {errorMessage && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          {/* Bookmarklet & Helper Box */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 text-xs text-zinc-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                Extrator do Facebook Marketplace
              </span>
              <button
                type="button"
                onClick={handleCopyBookmarklet}
                className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-amber-400 hover:bg-zinc-700 transition cursor-pointer"
              >
                {copiedBookmarklet ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar Bookmarklet</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              <strong>Como usar:</strong> Salve o botão acima como favorito no seu navegador. Quando abrir qualquer anúncio de carro no Facebook Marketplace, clique no favorito e o script copiará todos os dados e fotos em alta resolução direto para sua área de transferência.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-black hover:bg-amber-400 transition cursor-pointer"
          >
            <Check className="h-3.5 w-3.5 stroke-[3]" />
            <span>Preencher Formulário</span>
          </button>
        </div>
      </div>
    </div>
  );
};
