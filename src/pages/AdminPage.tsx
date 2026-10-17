import React, { useState, useEffect } from 'react';
import {
  Calendar,
  PlusCircle,
  Check,
  AlertCircle,
  Trash2,
  Edit3,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Database,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  FileCode,
} from 'lucide-react';
import {
  fetchAllChallenges,
  saveChallenge,
  deleteChallenge,
  AdminChallengeInput,
} from '../services/adminService';
import { uploadMultiplePhotos } from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabase';
import { ImportChallengeModal } from '../components/ImportChallengeModal';
import { formatBRL } from '../utils/currency';

interface AdminPageProps {
  onBackToGame: () => void;
}

const DEFAULT_PASS = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'adminbrick';
const AUTH_SESSION_KEY = 'taprobrick_admin_auth';

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToGame }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  });
  const [passInput, setPassInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [challenges, setChallenges] = useState<AdminChallengeInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [publishDate, setPublishDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [title, setTitle] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [photosText, setPhotosText] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [timePosted, setTimePosted] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [authorizationNotes, setAuthorizationNotes] = useState('');

  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const loadChallengesList = async () => {
    setIsLoading(true);
    const list = await fetchAllChallenges();
    setChallenges(list);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadChallengesList();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === DEFAULT_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      setAuthError('');
    } else {
      setAuthError('Senha incorreta.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  };

  const handleEdit = (challenge: AdminChallengeInput) => {
    setEditingId(challenge.id || null);
    setPublishDate(challenge.publishDate);
    setTitle(challenge.title);
    setPriceInput(String(challenge.price));
    setPhotosText(challenge.photos.join('\n'));
    setDescription(challenge.description);
    setLocation(challenge.location);
    setTimePosted(challenge.timePosted);
    setOriginalUrl(challenge.originalUrl || '');
    setAuthorizationNotes(challenge.authorizationNotes || '');
    setFormMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingId(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPublishDate(tomorrow.toISOString().split('T')[0]);
    setTitle('');
    setPriceInput('');
    setPhotosText('');
    setDescription('');
    setLocation('');
    setTimePosted('');
    setOriginalUrl('');
    setAuthorizationNotes('');
    setFormMessage(null);
  };

  const handleImportData = (data: any) => {
    if (data.title) setTitle(data.title);
    if (data.price !== undefined && data.price !== null) setPriceInput(String(data.price));
    if (data.photos && Array.isArray(data.photos)) setPhotosText(data.photos.join('\n'));
    if (data.description) setDescription(data.description);
    if (data.location) setLocation(data.location);
    if (data.timePosted) setTimePosted(data.timePosted);
    if (data.originalUrl) setOriginalUrl(data.originalUrl);
    if (data.authorizationNotes) setAuthorizationNotes(data.authorizationNotes);
    setFormMessage({
      type: 'success',
      text: 'Dados do anúncio importados com sucesso! Revise os campos e clique em Agendar Desafio.',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);

    const priceNum = parseFloat(priceInput.replace(/[^0-9]/g, ''));
    if (!title.trim() || isNaN(priceNum) || priceNum <= 0) {
      setFormMessage({ type: 'error', text: 'Preencha o título e um preço numérico válido.' });
      return;
    }

    const photos = photosText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (photos.length === 0) {
      setFormMessage({ type: 'error', text: 'Insira pelo menos 1 URL de foto para a capa do anúncio.' });
      return;
    }

    const payload: AdminChallengeInput = {
      id: editingId || undefined,
      publishDate,
      title: title.trim(),
      price: priceNum,
      photos,
      description: description.trim(),
      location: location.trim(),
      timePosted: timePosted.trim(),
      originalUrl: originalUrl.trim() || undefined,
      authorizationNotes: authorizationNotes.trim() || undefined,
    };

    const res = await saveChallenge(payload);
    if (res.success) {
      setFormMessage({
        type: 'success',
        text: editingId ? 'Desafio atualizado com sucesso!' : 'Novo desafio agendado com sucesso!',
      });
      handleResetForm();
      await loadChallengesList();
    } else {
      setFormMessage({ type: 'error', text: res.error || 'Erro ao salvar desafio.' });
    }
  };

  const handleDelete = async (id: string, challengeTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir o desafio "${challengeTitle}"?`)) return;
    await deleteChallenge(id);
    await loadChallengesList();
  };

  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const parsedPhotoUrls = photosText
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.startsWith('http') || p.startsWith('/'));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhotos(true);
    setUploadProgress(`0/${files.length}`);

    const fileList = Array.from(files);
    const { urls, errors } = await uploadMultiplePhotos(fileList, (done, total) => {
      setUploadProgress(`${done}/${total}`);
    });

    if (urls.length > 0) {
      setPhotosText((prev) => {
        const existing = prev.trim();
        const newUrls = urls.join('\n');
        return existing ? `${existing}\n${newUrls}` : newUrls;
      });
      setFormMessage({
        type: 'success',
        text: `${urls.length} foto(s) enviada(s) para o Supabase Storage com sucesso!`,
      });
    }

    if (errors.length > 0) {
      setFormMessage({
        type: 'error',
        text: `Erro ao enviar algumas fotos: ${errors.join(', ')}`,
      });
    }

    setIsUploadingPhotos(false);
    e.target.value = '';
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const updated = parsedPhotoUrls.filter((_, idx) => idx !== indexToRemove);
    setPhotosText(updated.join('\n'));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Tela de Login / Proteção
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 font-black text-black">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">Painel do Curador</h1>
              <p className="text-xs text-zinc-400">Acesso administrativo Tá pro Brick</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                autoFocus
              />
              {authError && <p className="mt-1.5 text-xs text-rose-400 font-semibold">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-black text-black hover:bg-amber-400 transition cursor-pointer"
            >
              Acessar Painel
            </button>
          </form>

          <button
            type="button"
            onClick={onBackToGame}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para o jogo
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Administrativo
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 sm:px-8 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToGame}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Jogo</span>
          </button>
          <div className="hidden sm:block">
            <h1 className="text-base font-black text-white">Tá pro Brick • Admin</h1>
            <p className="text-[11px] text-zinc-400">Curadoria & Agendamento Diário</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-semibold">
            <Database className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] text-zinc-300">
              {isSupabaseConfigured() ? 'Supabase Conectado' : 'Modo Offline / Local'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-zinc-400 hover:text-white transition cursor-pointer font-medium"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Desafios no Banco</p>
            <p className="mt-1 text-2xl font-black text-white">{challenges.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Desafio de Hoje</p>
            <p className="mt-1 text-sm font-bold text-amber-400 truncate">
              {challenges.find((c) => c.publishDate === todayStr)?.title || 'Nenhum programado'}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dias Futuros Cobertos</p>
            <p className="mt-1 text-2xl font-black text-emerald-400">
              {challenges.filter((c) => c.publishDate > todayStr).length} dias
            </p>
          </div>
        </div>

        {/* Form: Add or Edit Challenge */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-black text-white">
                {editingId ? 'Editar Desafio Agendado' : 'Agendar Novo Desafio'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-zinc-700 hover:text-amber-300 transition cursor-pointer"
                title="Preencher campos a partir do extrator do Facebook Marketplace ou JSON"
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>Importar Anúncio (JSON)</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </div>

          {formMessage && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${
                formMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {formMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{formMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Data de Publicação *
                </label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Título do Veículo / Anúncio *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Jeep Renegade Longitude 2023 Flex Aut."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Preço Real Pedido pelo Vendedor (R$) *
                </label>
                <input
                  type="text"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="Ex: 91990"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Cidade e Estado (Pista 4)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Curitiba, PR"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Tempo desde Publicação (Pista 5)
                </label>
                <input
                  type="text"
                  value={timePosted}
                  onChange={(e) => setTimePosted(e.target.value)}
                  placeholder="Ex: Anunciado há 3 dias"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Photos */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                  <span>Fotos do Anúncio (a 1ª será a capa) *</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {parsedPhotoUrls.length} foto(s)
                  </span>
                  <label className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-zinc-700 hover:text-amber-300 transition cursor-pointer">
                    {isUploadingPhotos ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Enviando {uploadProgress}...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload do Dispositivo</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhotos}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <textarea
                value={photosText}
                onChange={(e) => setPhotosText(e.target.value)}
                rows={3}
                placeholder="URLs das fotos (1 por linha) ou use o botão de Upload acima..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-amber-500 focus:outline-none"
                required
              />

              {parsedPhotoUrls.length > 0 && (
                <div className="mt-2.5 flex items-center gap-2.5 overflow-x-auto pb-1.5">
                  {parsedPhotoUrls.map((url, i) => (
                    <div
                      key={i}
                      className="group relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900"
                    >
                      <img src={url} alt={`Preview ${i}`} className="h-full w-full object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[9px] text-center font-bold text-amber-400 py-0.5">
                        {i === 0 ? 'Capa' : `#${i + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute top-1 right-1 h-4 w-4 rounded-full bg-black/80 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
                        title="Remover foto"
                      >
                        <X className="h-2.5 w-2.5 stroke-[3]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Descrição do Anúncio (Pista 3)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Cole o texto que o vendedor colocou no anúncio..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Original URL & Authorization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Link do Anúncio Original
                </label>
                <input
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://facebook.com/marketplace/item/..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>Registro de Autorização / Origem</span>
                </label>
                <input
                  type="text"
                  value={authorizationNotes}
                  onChange={(e) => setAuthorizationNotes(e.target.value)}
                  placeholder="Ex: Autorizado via DM com vendedor / Grupo público"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-black text-black hover:bg-amber-400 transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {editingId ? 'Salvar Alterações' : 'Salvar e Agendar Desafio'}
              </button>
            </div>
          </form>
        </section>

        {/* Scheduled Challenges Table */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-black text-white">Fila & Calendário de Desafios</h2>
            </div>
            <span className="text-xs text-zinc-400 font-semibold">{challenges.length} cadastrados</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-zinc-500">Carregando desafios...</div>
            ) : challenges.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">Nenhum desafio cadastrado ainda.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="pb-2.5">Data</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5">Veículo</th>
                    <th className="pb-2.5">Preço</th>
                    <th className="pb-2.5">Fotos</th>
                    <th className="pb-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {challenges.map((c) => {
                    const isToday = c.publishDate === todayStr;
                    const isFuture = c.publishDate > todayStr;

                    return (
                      <tr key={c.id || c.publishDate} className="hover:bg-zinc-800/40 transition">
                        <td className="py-3 font-mono font-bold text-zinc-200">
                          {c.publishDate}
                        </td>
                        <td className="py-3">
                          {isToday ? (
                            <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black text-amber-300">
                              HOJE
                            </span>
                          ) : isFuture ? (
                            <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                              AGENDADO
                            </span>
                          ) : (
                            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                              PASSADO
                            </span>
                          )}
                        </td>
                        <td className="py-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            {c.photos[0] && (
                              <img
                                src={c.photos[0]}
                                alt=""
                                className="h-8 w-8 rounded-lg object-cover shrink-0 border border-zinc-700"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="truncate max-w-[200px] sm:max-w-xs">{c.title}</p>
                              {c.location && <p className="text-[10px] text-zinc-500">{c.location}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-black text-amber-400">
                          {formatBRL(c.price)}
                        </td>
                        <td className="py-3 text-zinc-400">
                          {c.photos.length} fotos
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEdit(c)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => c.id && handleDelete(c.id, c.title)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      <ImportChallengeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportData}
      />
    </div>
  );
};
