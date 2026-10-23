import React, { useState } from 'react';
import { X, FileCode, Check, AlertCircle, Copy, Bookmark, Upload, CloudUpload, Loader2 } from 'lucide-react';
import { useBrowserBackClose } from '../hooks/useBrowserBackClose';
import { FB_MARKETPLACE_BOOKMARKLET } from '../utils/bookmarklet';
import { isExternalPhotoUrl, transferExternalPhotosToStorage } from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabase';

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
  useBrowserBackClose(isOpen, onClose, 'import-challenge-modal');

  const [jsonText, setJsonText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [autoUploadToStorage, setAutoUploadToStorage] = useState(isSupabaseConfigured());
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState('');

  if (!isOpen) return null;

  const processAndImport = async (parsed: any) => {
    setErrorMessage('');
    const photos: string[] = Array.isArray(parsed?.photos) ? parsed.photos : [];
    const hasExternalPhotos = photos.some(isExternalPhotoUrl);

    if (autoUploadToStorage && isSupabaseConfigured() && hasExternalPhotos) {
      setIsTransferring(true);
      setTransferStatus(`Iniciando envio de ${photos.length} foto(s) para o Supabase Storage...`);

      const prefix = (parsed.title || 'car')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .slice(0, 30);

      try {
        const result = await transferExternalPhotosToStorage(
          photos,
          prefix,
          (done, total) => {
            setTransferStatus(`Salvando fotos no Supabase Storage... (${done}/${total})`);
          }
        );

        parsed.photos = result.updatedUrls;
      } catch (err: any) {
        console.warn('Erro ao transferir fotos para o storage:', err);
      } finally {
        setIsTransferring(false);
      }
    }

    onImport(parsed);
    onClose();
  };

  const handleApply = async () => {
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

      await processAndImport(parsed);
    } catch (err: any) {
      setErrorMessage(`JSON inválido: ${err.message || 'Verifique o formato colado.'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) return;
        setJsonText(content);
        const parsed = JSON.parse(content);
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Arquivo não contém um objeto JSON válido.');
        }
        await processAndImport(parsed);
      } catch (err: any) {
        setErrorMessage(`Falha ao ler arquivo: ${err.message || 'JSON inválido'}`);
      }
    };
    reader.readAsText(file);
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Cole o JSON ou carregue o arquivo:
              </label>
              <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 px-2 py-1 rounded-lg cursor-pointer transition">
                <Upload className="h-3 w-3" />
                <span>Subir .json</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={6}
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

            {/* Opção de Auto-Upload para Supabase Storage */}
            {isSupabaseConfigured() ? (
              <label className="mt-2.5 flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition select-none">
                <input
                  type="checkbox"
                  checked={autoUploadToStorage}
                  onChange={(e) => setAutoUploadToStorage(e.target.checked)}
                  disabled={isTransferring}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <CloudUpload className="h-3.5 w-3.5 text-amber-400" />
                    Salvar fotos no Supabase Storage automaticamente (Recomendado)
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Baixa as fotos do Facebook CDN e hospeda permanentemente no nosso banco para evitar links quebrados por expiração.
                  </span>
                </div>
              </label>
            ) : (
              <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-2 text-[11px] text-zinc-400">
                <CloudUpload className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                <span>Supabase Storage offline. Em produção, fotos externas serão migradas automaticamente.</span>
              </div>
            )}

            {/* Progresso de Transferência */}
            {isTransferring && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-pulse">
                <Loader2 className="h-4 w-4 text-amber-400 animate-spin shrink-0" />
                <span className="text-xs font-bold text-amber-300">{transferStatus}</span>
              </div>
            )}
          </div>

          {/* Bookmarklet & Helper Box */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 text-xs text-zinc-300 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                Extrator do Facebook Marketplace
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={FB_MARKETPLACE_BOOKMARKLET}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCopyBookmarklet();
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-black text-black hover:bg-amber-400 transition cursor-grab shadow-sm"
                  title="Clique e arraste este botão direto para a Barra de Favoritos do seu navegador"
                >
                  <span>🧱</span>
                  <span>Arraste para os Favoritos</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyBookmarklet}
                  className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
                  title="Copiar código javascript para colar no favorito"
                >
                  {copiedBookmarklet ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              <strong>Como instalar:</strong> Arraste o botão amarelo acima para a barra de favoritos do navegador. Quando abrir qualquer carro no Facebook Marketplace, clique no favorito e o modal aparecerá na hora!
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isTransferring}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isTransferring}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-black hover:bg-amber-400 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTransferring ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Enviando para o Storage...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>Preencher Formulário</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
