import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Mail,
  Car,
  ExternalLink,
  Cookie,
  ShieldCheck,
} from 'lucide-react';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'suggest' | 'remove' | 'contact';
}

const CONTACT_EMAIL = (import.meta as any).env?.VITE_CONTACT_EMAIL || 'contato@taprobrick.com.br';
const INSTAGRAM_HANDLE = (import.meta as any).env?.VITE_INSTAGRAM_HANDLE || 'taprobrick';

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'suggest',
}) => {
  const [activeTab, setActiveTab] = useState<'suggest' | 'remove' | 'contact'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Suggest Form
  const [suggestUrl, setSuggestUrl] = useState('');
  const [suggestModel, setSuggestModel] = useState('');
  const [suggestNotes, setSuggestNotes] = useState('');
  const [copiedSuggest, setCopiedSuggest] = useState(false);

  // Removal Form
  const [removeChallenge, setRemoveChallenge] = useState('');
  const [removeEmail, setRemoveEmail] = useState('');
  const [removeReason, setRemoveReason] = useState('');
  const [copiedRemoval, setCopiedRemoval] = useState(false);

  if (!isOpen) return null;

  const handleSendSuggestion = () => {
    const subject = encodeURIComponent(`[Sugestão de Anúncio] ${suggestModel || 'Novo Carro'}`);
    const body = encodeURIComponent(
      `Olá equipe do Tá pro Brick!\n\n` +
      `Gostaria de sugerir este anúncio para o desafio diário:\n` +
      `Link do anúncio: ${suggestUrl}\n` +
      `Modelo/Ano: ${suggestModel}\n` +
      `Observações: ${suggestNotes}\n\n` +
      `Enviado pelo site Tá pro Brick.`
    );
    window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSendSuggestionInstagram = () => {
    const text =
      `Fala galera do @${INSTAGRAM_HANDLE}!\n` +
      `Sugestão de anúncio pro Tá pro Brick:\n` +
      `Link: ${suggestUrl || '(não informado)'}\n` +
      (suggestModel ? `Modelo: ${suggestModel}\n` : '') +
      (suggestNotes ? `Obs: ${suggestNotes}\n` : '');

    try {
      navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
    setCopiedSuggest(true);
    setTimeout(() => setCopiedSuggest(false), 2500);
    window.open(`https://ig.me/m/${INSTAGRAM_HANDLE}`, '_blank');
  };

  const handleSendRemoval = () => {
    const subject = encodeURIComponent(`[Urgente: Remoção de Anúncio] ${removeChallenge || 'Desafio'}`);
    const body = encodeURIComponent(
      `Olá equipe do Tá pro Brick,\n\n` +
      `Solicito a remoção do seguinte anúncio do jogo:\n` +
      `Veículo / Data do desafio: ${removeChallenge}\n` +
      `Meu e-mail para contato: ${removeEmail}\n` +
      `Motivo / Relação com o anúncio: ${removeReason}\n\n` +
      `Aguardo retorno e remoção conforme termos do jogo.`
    );
    window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSendRemovalInstagram = () => {
    const text =
      `Olá @${INSTAGRAM_HANDLE},\n` +
      `Gostaria de solicitar a remoção de um anúncio do Tá pro Brick:\n` +
      `Desafio/Veículo: ${removeChallenge || '(não informado)'}\n` +
      `Contato: ${removeEmail || '(não informado)'}\n` +
      (removeReason ? `Motivo: ${removeReason}\n` : '');

    try {
      navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
    setCopiedRemoval(true);
    setTimeout(() => setCopiedRemoval(false), 2500);
    window.open(`https://ig.me/m/${INSTAGRAM_HANDLE}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Contato & Comunidade
            </h2>
            <p className="text-xs text-zinc-400">Sugestões, remoções e canais oficiais</p>
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

        {/* Tab Switcher */}
        <div className="mt-3.5 grid grid-cols-3 gap-1 rounded-xl bg-zinc-900 p-1 border border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('suggest')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'suggest'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            Sugerir
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('remove')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'remove'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Remoção
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Redes
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {/* TAB 1: SUGERIR ANÚNCIO */}
          {activeTab === 'suggest' && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <span className="font-bold">Viu uma relíquia, lasanha ou preço surreal na internet?</span>
                <p className="mt-0.5 text-zinc-300">
                  Envie o link para avaliarmos e colocarmos no Desafio Diário do Tá pro Brick!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Link do Anúncio (OLX, Facebook Marketplace, Webmotors...) *
                </label>
                <input
                  type="url"
                  value={suggestUrl}
                  onChange={(e) => setSuggestUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Modelo do Carro & Ano (opcional)
                </label>
                <input
                  type="text"
                  value={suggestModel}
                  onChange={(e) => setSuggestModel(e.target.value)}
                  placeholder="Ex: Opala Comodoro 1989"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Por que esse anúncio é especial? (opcional)
                </label>
                <textarea
                  value={suggestNotes}
                  onChange={(e) => setSuggestNotes(e.target.value)}
                  rows={2}
                  placeholder="Ex: O cara pede 100k num Celta / descrição inacreditável..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendSuggestionInstagram}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer shadow-sm"
                  title="Copia a sugestão e abre o Instagram Direct"
                >
                  <InstagramIcon className="h-4 w-4 text-zinc-300" />
                  {copiedSuggest ? 'Copiado! Abrindo Direct...' : 'Enviar por Instagram'}
                </button>
                <button
                  type="button"
                  onClick={handleSendSuggestion}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer shadow-sm"
                >
                  <Mail className="h-4 w-4 text-zinc-300" />
                  Enviar por E-mail
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REMOVER ANÚNCIO (LGPD & DIREITOS AUTORAIS) */}
          {activeTab === 'remove' && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-rose-400" />
                  Compromisso de Respeito aos Proprietários
                </span>
                <p className="mt-1 text-zinc-300 leading-relaxed">
                  O Tá pro Brick é um jogo educativo e de entretenimento com anúncios públicos. Se você é o proprietário do veículo ou autor das fotos e deseja a remoção de um anúncio publicado, solicite abaixo e realizaremos a retirada imediata.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Qual anúncio ou data do desafio? *
                </label>
                <input
                  type="text"
                  value={removeChallenge}
                  onChange={(e) => setRemoveChallenge(e.target.value)}
                  placeholder="Ex: Desafio #2 / Jeep Renegade"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Seu E-mail ou Telefone de Contato *
                </label>
                <input
                  type="text"
                  value={removeEmail}
                  onChange={(e) => setRemoveEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Motivo da Solicitação
                </label>
                <textarea
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  rows={2}
                  placeholder="Ex: Sou o proprietário e já vendi o carro / não autorizo o uso das fotos..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendRemovalInstagram}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer shadow-sm"
                  title="Copia a solicitação e abre o Instagram Direct"
                >
                  <InstagramIcon className="h-4 w-4 text-zinc-300" />
                  {copiedRemoval ? 'Copiado! Abrindo Direct...' : 'Pedir pelo Instagram'}
                </button>
                <button
                  type="button"
                  onClick={handleSendRemoval}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer shadow-sm"
                >
                  <ShieldAlert className="h-4 w-4 text-zinc-300" />
                  Solicitar por E-mail
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REDES SOCIAIS & CONTATO OFICIAL */}
          {activeTab === 'contact' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 hover:border-amber-500/40 hover:bg-zinc-800 transition"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white">
                    <InstagramIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Instagram</p>
                    <p className="text-[11px] text-zinc-400 truncate">@{INSTAGRAM_HANDLE}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-500 ml-auto" />
                </a>

                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 hover:border-amber-500/40 hover:bg-zinc-800 transition"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-black">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">E-mail</p>
                    <p className="text-[11px] text-zinc-400 truncate">{CONTACT_EMAIL}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-500 ml-auto" />
                </a>
              </div>

              {/* Informações de Privacidade e LGPD */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 text-xs text-zinc-400 space-y-2">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Cookie className="h-4 w-4 text-amber-400" />
                  Privacidade, Dados & LGPD
                </p>
                <p className="leading-relaxed text-[11px]">
                  • <strong>Sem cadastro obrigatório:</strong> O Tá pro Brick pode ser jogado 100% anonimamente, sem necessidade de informar nome ou e-mail.
                </p>
                <p className="leading-relaxed text-[11px]">
                  • <strong>Armazenamento Local:</strong> Seus palpites e sequências diárias são gravados diretamente no armazenamento do seu navegador (<code className="text-amber-300">localStorage</code>).
                </p>
                <p className="leading-relaxed text-[11px]">
                  • <strong>Cookies & Publicidade:</strong> Quando ativos, cookies de publicidade não-intrusiva (Google AdSense) e métricas são utilizados para manter os custos de servidores do jogo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
