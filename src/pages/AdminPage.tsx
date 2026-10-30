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
  AlertTriangle,
  CloudUpload,
  Sparkles,
  Lock,
  Mail,
} from 'lucide-react';
import {
  fetchAllChallenges,
  saveChallenge,
  deleteChallenge,
  AdminChallengeInput,
} from '../services/adminService';
import {
  uploadMultiplePhotos,
  isExternalPhotoUrl,
  transferExternalPhotosToStorage,
} from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabase';
import {
  signInAdmin,
  signInAdminWithGoogle,
  signOutAdmin,
  validateAdminSession,
  subscribeToAuthChanges,
} from '../services/authService';
import { ImportChallengeModal } from '../components/ImportChallengeModal';
import { formatBRL } from '../utils/currency';
import { getNextAvailablePublishDate } from '../utils/publishDate';

interface AdminPageProps {
  onBackToGame: () => void;
}

const DEFAULT_PASS = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'adminbrick';
const AUTH_SESSION_KEY = 'taprobrick_admin_auth';

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToGame }) => {
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !isSupabaseConfigured() && sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  });

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
    if (!editingId) {
      setPublishDate(getNextAvailablePublishDate(list));
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured()) {
      validateAdminSession().then(({ session, error }) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setCurrentAdminEmail(session.user.email || null);
          setAuthError('');
        } else if (error) {
          setAuthError(error);
        }
      });

      const { unsubscribe } = subscribeToAuthChanges((session, error) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setCurrentAdminEmail(session.user.email || null);
          setAuthError('');
        } else {
          setIsAuthenticated(false);
          setCurrentAdminEmail(null);
          if (error) {
            setAuthError(error);
          }
        }
      });

      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadChallengesList();
    }
  }, [isAuthenticated]);

  const handleGoogleLogin = async () => {
    setAuthError('');
    setIsGoogleAuthenticating(true);
    const res = await signInAdminWithGoogle();
    if (res.error) {
      setAuthError(res.error);
      setIsGoogleAuthenticating(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isSupabaseConfigured()) {
      if (!emailInput.trim() || !passInput) {
        setAuthError('Preencha seu e-mail e senha.');
        return;
      }

      setIsAuthenticating(true);
      const res = await signInAdmin(emailInput, passInput);
      setIsAuthenticating(false);

      if (res.error) {
        setAuthError(res.error);
      } else {
        setIsAuthenticated(true);
        setCurrentAdminEmail(res.user?.email || null);
        setPassInput('');
      }
    } else {
      if (passInput === DEFAULT_PASS) {
        setIsAuthenticated(true);
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        setAuthError('');
      } else {
        setAuthError('Senha incorreta.');
      }
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await signOutAdmin();
    }
    setIsAuthenticated(false);
    setCurrentAdminEmail(null);
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

  const handleResetForm = (challengeList?: AdminChallengeInput[]) => {
    setEditingId(null);
    setPublishDate(getNextAvailablePublishDate(challengeList || challenges));
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
      const updatedList = await fetchAllChallenges();
      setChallenges(updatedList);
      handleResetForm(updatedList);
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

  const [isMigratingPhotos, setIsMigratingPhotos] = useState(false);
  const [migrateProgress, setMigrateProgress] = useState('');

  const handleMigrateExternalPhotos = async () => {
    if (!isSupabaseConfigured()) {
      setFormMessage({ type: 'error', text: 'Supabase não está configurado.' });
      return;
    }

    const externalUrls = parsedPhotoUrls.filter(isExternalPhotoUrl);
    if (externalUrls.length === 0) {
      setFormMessage({ type: 'success', text: 'Todas as fotos já estão hospedadas com segurança!' });
      return;
    }

    setIsMigratingPhotos(true);
    setMigrateProgress(`0/${parsedPhotoUrls.length}`);

    const prefix = (title || 'car')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .slice(0, 30);

    const result = await transferExternalPhotosToStorage(
      parsedPhotoUrls,
      prefix,
      (done, total) => setMigrateProgress(`${done}/${total}`)
    );

    setPhotosText(result.updatedUrls.join('\n'));
    setIsMigratingPhotos(false);

    if (result.transferredCount > 0) {
      setFormMessage({
        type: 'success',
        text: `${result.transferredCount} foto(s) migrada(s) para o Supabase Storage permanente com sucesso!`,
      });
    }

    if (result.failedCount > 0) {
      setFormMessage({
        type: 'error',
        text: `Atenção: ${result.failedCount} foto(s) não puderam ser baixadas (possível link expirado). Erros: ${result.errors.join('; ')}`,
      });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Tela de Login / Proteção
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 font-black text-black">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">Painel do Curador</h1>
              <p className="text-xs text-zinc-400">Acesso seguro Tá pro Brick</p>
            </div>
          </div>

          {isSupabaseConfigured() ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleAuthenticating || isAuthenticating}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-zinc-700 bg-zinc-950 py-2.5 px-4 text-sm font-bold text-white hover:bg-zinc-800 hover:border-zinc-600 transition cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isGoogleAuthenticating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                    <span>Conectando com o Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Entrar com Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-800 w-full"></div>
                <span className="bg-zinc-900 px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider absolute">
                  ou com e-mail
                </span>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-amber-400" />
                    <span>E-mail de Administrador</span>
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@taprobrick.com.br"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Senha</span>
                  </label>
                  <input
                    type="password"
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 font-medium leading-relaxed flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating || isGoogleAuthenticating}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-black text-black hover:bg-amber-400 transition cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Entrar com E-mail</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-3.5 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-300">
                ℹ️ Supabase desconectado. Usando senha de desenvolvedor local.
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Senha de Acesso (Modo Offline)
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
            </div>
          )}

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
          {currentAdminEmail && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="truncate max-w-[180px]">{currentAdminEmail}</span>
            </div>
          )}
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
                  onClick={() => handleResetForm()}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-300">
                    Data de Publicação *
                  </label>
                  {(() => {
                    const nextFree = getNextAvailablePublishDate(challenges);
                    if (nextFree && publishDate !== nextFree) {
                      const [, m, d] = nextFree.split('-');
                      const displayDate = d && m ? `${d}/${m}` : nextFree;
                      return (
                        <button
                          type="button"
                          onClick={() => setPublishDate(nextFree)}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
                          title="Preencher com a próxima data livre de desafios"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Próxima livre ({displayDate})</span>
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  required
                />
                {(() => {
                  const conflict = challenges.find((c) => c.publishDate === publishDate && c.id !== editingId);
                  if (conflict) {
                    return (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span className="truncate">Já ocupada por "{conflict.title}"</span>
                      </p>
                    );
                  }
                  return null;
                })()}
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

              {/* Alerta e Botão de Migração de Fotos Externas */}
              {parsedPhotoUrls.some(isExternalPhotoUrl) && (
                <div className="mt-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-300">
                      <strong>{parsedPhotoUrls.filter(isExternalPhotoUrl).length} foto(s) externa(s) detectada(s).</strong> Links do Facebook expiram com o tempo.
                    </span>
                  </div>
                  {isSupabaseConfigured() ? (
                    <button
                      type="button"
                      onClick={handleMigrateExternalPhotos}
                      disabled={isMigratingPhotos}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-black text-black hover:bg-amber-400 transition cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                    >
                      {isMigratingPhotos ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Migrando {migrateProgress}...</span>
                        </>
                      ) : (
                        <>
                          <CloudUpload className="h-3.5 w-3.5" />
                          <span>Migrar para Supabase</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] text-amber-400/80 font-medium self-start sm:self-auto">
                      (Supabase desconectado)
                    </span>
                  )}
                </div>
              )}

              {parsedPhotoUrls.length > 0 && (
                <div className="mt-2.5 flex items-center gap-2.5 overflow-x-auto pb-1.5">
                  {parsedPhotoUrls.map((url, i) => {
                    const isExternal = isExternalPhotoUrl(url);
                    return (
                      <div
                        key={i}
                        className="group relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900"
                      >
                        <img src={url} alt={`Preview ${i}`} className="h-full w-full object-cover" />
                        <span
                          className={`absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] font-bold ${
                            isExternal
                              ? 'bg-amber-500/90 text-black'
                              : 'bg-emerald-600/90 text-white'
                          }`}
                          title={isExternal ? 'Foto externa / Facebook CDN (temporária)' : 'Hospedada no Supabase Storage'}
                        >
                          {isExternal ? 'FB' : '✓'}
                        </span>
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
                    );
                  })}
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
