import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VehicleSelector } from './components/VehicleSelector';
import { ClueViewer } from './components/ClueViewer';
import { GuessHistory } from './components/GuessHistory';
import { GuessInput } from './components/GuessInput';
import { VictoryModal } from './components/VictoryModal';
import { HelpModal } from './components/HelpModal';
import { StatsModal } from './components/StatsModal';
import { LastGuessFeedback } from './components/LastGuessFeedback';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AdminPage } from './pages/AdminPage';
import { CookieBanner } from './components/CookieBanner';
import { ContactModal } from './components/ContactModal';
import { AdBannerSlot } from './components/AdBannerSlot';
import { submitDailyResult } from './services/rankingService';
import { getOrCreatePlayerProfile, syncPlayerProfileToSupabase, initAuthListener } from './services/playerService';
import { trackEvent } from './services/analyticsService';

import { Challenge, GameState, RoundStatus } from './types/game';
import { GAME_CONFIG } from './config/gameConfig';
import { evaluateGuess, calculateScore } from './utils/gameLogic';
import {
  loadPlayerStats,
  savePlayerStats,
  loadSavedGameStates,
  saveGameStates,
  calculateNextStats,
  getTodayDateString,
  PlayerStats,
} from './utils/statsManager';
import {
  getDailyChallengeIndex,
  getDailyChallengeNumber,
} from './utils/dailyChallenge';
import { generateShareText, shareGameResult } from './utils/shareText';
import confetti from 'canvas-confetti';
import { DailyCountdown } from './components/DailyCountdown';
import { WeeklyLeaderboardWidget } from './components/WeeklyLeaderboardWidget';
import { loadActiveChallenges } from './services/challengeService';
import mockChallengesData from './data/mockChallenges.json';

const initialDefaultChallenges: Challenge[] = mockChallengesData as Challenge[];
const ONBOARDING_STORAGE_KEY = 'taprobrick_has_seen_onboarding';

// Feature flags
const ENABLE_ADS = false; // Desabilitado temporariamente
const ENABLE_ARCHIVE_MODE = false; // Modo de desafios passados / treino. Quando for lançado no futuro, será chamado de "Arquivo".

function createInitialGameState(challenge: Challenge): GameState {
  return {
    challenge,
    guesses: [],
    maxAttempts: GAME_CONFIG.maxAttempts,
    status: 'in_progress',
    bestGuess: null,
    totalScore: 0,
    hasEndedEarly: false,
  };
}

function getUnlockedClueInfo(guessesCount: number) {
  switch (guessesCount) {
    case 1:
      return { label: 'Galeria de Fotos', elementId: 'clue-section-gallery' };
    case 2:
      return { label: 'Descrição do Anúncio', elementId: 'clue-section-description' };
    case 3:
      return { label: 'Cidade e Estado', elementId: 'clue-section-location' };
    case 4:
      return { label: 'Tempo de Publicação', elementId: 'clue-section-time' };
    default:
      return null;
  }
}

export function App() {
  const [gameMode, setGameMode] = useState<'daily' | 'training'>('daily');
  const [trainingChallengeIndex, setTrainingChallengeIndex] = useState<number>(0);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => loadPlayerStats());
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isShareCopied, setIsShareCopied] = useState<boolean>(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [leaderboardInitialTab, setLeaderboardInitialTab] = useState<'daily' | 'weekly'>('daily');
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [contactInitialTab, setContactInitialTab] = useState<'suggest' | 'remove' | 'contact'>('suggest');

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/admin' ||
        window.location.search.includes('admin') ||
        window.location.hash === '#admin')
    );
  });

  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdminRoute(
        window.location.pathname === '/admin' ||
        window.location.search.includes('admin') ||
        window.location.hash === '#admin'
      );
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    try {
      localStorage.removeItem('taprobrick_theme');
    } catch {
      // Ignore
    }
  }, []);

  const [challenges, setChallenges] = useState<Challenge[]>(initialDefaultChallenges);

  useEffect(() => {
    loadActiveChallenges().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setChallenges(loaded);
        setGameStates((prev) => {
          const updated = { ...prev };
          let changed = false;
          loaded.forEach((c) => {
            if (!updated[c.id]) {
              updated[c.id] = createInitialGameState(c);
              changed = true;
            }
          });
          return changed ? updated : prev;
        });
      }
    });
  }, []);

  const todayDateStr = getTodayDateString();
  const scheduledTodayChallenge = challenges.find((c) => c.publishDate === todayDateStr);
  const dailyChallengeIndex = getDailyChallengeIndex(challenges.length, todayDateStr);
  const dailyChallengeNumber = getDailyChallengeNumber(todayDateStr);
  const dailyChallenge = scheduledTodayChallenge || challenges[dailyChallengeIndex] || challenges[0];

  const activeChallenge =
    gameMode === 'daily'
      ? dailyChallenge
      : challenges[trainingChallengeIndex] || challenges[0];

  const [gameStates, setGameStates] = useState<Record<string, GameState>>(() => {
    const saved = loadSavedGameStates();
    if (saved && Object.keys(saved).length > 0) {
      const merged = { ...saved };
      challenges.forEach((c) => {
        if (!merged[c.id]) {
          merged[c.id] = createInitialGameState(c);
        }
      });
      return merged;
    }
    const initial: Record<string, GameState> = {};
    challenges.forEach((c) => {
      initial[c.id] = createInitialGameState(c);
    });
    return initial;
  });

  // Save game state progress to localStorage whenever gameStates change
  useEffect(() => {
    saveGameStates(gameStates);
  }, [gameStates]);

  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(ONBOARDING_STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const currentGameState =
    gameStates[activeChallenge.id] || createInitialGameState(activeChallenge);
  const isDailyCompleted = gameStates[dailyChallenge.id]?.status === 'completed';

  // Sincroniza o perfil do jogador e todos os desafios já concluídos localmente com o Supabase
  useEffect(() => {
    // 1. Assegura que o perfil do jogador existe no Supabase
    const profile = getOrCreatePlayerProfile();
    syncPlayerProfileToSupabase(profile);

    // 2. Escuta mudanças na sessão de autenticação (ex: retorno do login com Google)
    const unsubscribeAuth = initAuthListener();

    // 3. Sincroniza qualquer desafio que já tenha sido concluído localmente (inclusive desafios de dias anteriores salvos)
    Object.entries(gameStates).forEach(([chId, state]) => {
      if (state && state.status === 'completed' && state.guesses && state.guesses.length > 0) {
        const remaining = state.maxAttempts - state.guesses.length;
        const score = calculateScore(state.guesses, remaining, GAME_CONFIG);
        const isWin = score.bestGuess?.isWin ?? false;
        submitDailyResult({
          challengeId: chId,
          score: score.totalScore,
          attemptsCount: state.guesses.length,
          bestGuess: score.bestGuess?.guessValue || null,
          won: isWin,
        });
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [dailyChallenge.id]);

  const handleCloseHelp = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {
      // Ignore in private storage environments
    }
    setIsHelpOpen(false);
  };

  const handleShareDaily = async () => {
    const dailyState = gameStates[dailyChallenge.id];
    if (!dailyState) return;

    const remaining = dailyState.maxAttempts - dailyState.guesses.length;
    const score = calculateScore(dailyState.guesses, remaining, GAME_CONFIG);
    const text = generateShareText(
      dailyState.guesses,
      score,
      dailyChallenge.title,
      dailyState.maxAttempts,
      dailyChallengeNumber
    );

    trackEvent('share_result', {
      challengeId: dailyChallenge.id,
      dayNumber: dailyChallengeNumber,
    });

    const outcome = await shareGameResult({
      text,
      title: `Tá pro Brick #${dailyChallengeNumber}`,
    });

    if (outcome === 'copied' || outcome === 'shared') {
      setIsShareCopied(true);
      setTimeout(() => setIsShareCopied(false), 2500);
    }
  };

  // Remaining unused attempts
  const remainingAttempts = currentGameState.maxAttempts - currentGameState.guesses.length;

  // Clues unlocked: starts at 1, increases with each guess up to 5, or reveals all (5) when round is completed!
  const unlockedCluesCount =
    currentGameState.status === 'completed'
      ? 5
      : Math.min(5, currentGameState.guesses.length + 1);

  // Current score breakdown
  const scoreBreakdown = calculateScore(
    currentGameState.guesses,
    remainingAttempts,
    GAME_CONFIG
  );

  const handleConfirmGuess = (guessValue: number) => {
    if (currentGameState.status === 'completed') return;

    const evaluation = evaluateGuess(guessValue, activeChallenge.askingPrice, GAME_CONFIG);
    const updatedGuesses = [...currentGameState.guesses, evaluation];
    const newRemainingAttempts = currentGameState.maxAttempts - updatedGuesses.length;

    trackEvent('guess_attempt', {
      attemptNumber: updatedGuesses.length,
      heatBand: evaluation.heatBand,
      challengeId: activeChallenge.id,
    });

    let nextStatus: RoundStatus = 'in_progress';

    if (evaluation.heatBand === 'exact') {
      nextStatus = 'completed';
    } else if (evaluation.isWin && newRemainingAttempts > 0) {
      nextStatus = 'won_can_continue';
    } else if (updatedGuesses.length >= currentGameState.maxAttempts) {
      nextStatus = 'completed';
    }

    const updatedScore = calculateScore(updatedGuesses, newRemainingAttempts, GAME_CONFIG);

    setGameStates((prev) => ({
      ...prev,
      [activeChallenge.id]: {
        ...currentGameState,
        guesses: updatedGuesses,
        status: nextStatus,
        bestGuess: updatedScore.bestGuess,
        totalScore: updatedScore.totalScore,
      },
    }));

    if (nextStatus === 'completed') {
      const isWin = evaluation.isWin || updatedScore.bestGuess?.isWin || false;
      const nextStats = calculateNextStats(playerStats, {
        challengeId: activeChallenge.id,
        isWin,
        attemptsUsed: updatedGuesses.length,
      });
      setPlayerStats(nextStats);
      savePlayerStats(nextStats);

      trackEvent('game_completed', {
        challengeId: activeChallenge.id,
        won: isWin,
        attemptsCount: updatedGuesses.length,
        score: updatedScore.totalScore,
      });

      submitDailyResult({
        challengeId: activeChallenge.id,
        score: updatedScore.totalScore,
        attemptsCount: updatedGuesses.length,
        bestGuess: updatedScore.bestGuess?.guessValue || null,
        won: isWin,
      });

      if (isWin) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'],
        });
      }
      setIsVictoryModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (nextStatus === 'won_can_continue') {
      setIsVictoryModalOpen(true);
      return;
    }

    // Scroll smoothly to newly unlocked clue
    const clueInfo = getUnlockedClueInfo(updatedGuesses.length);
    if (clueInfo?.elementId) {
      setTimeout(() => {
        document.getElementById(clueInfo.elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleContinuePlaying = () => {
    setGameStates((prev) => ({
      ...prev,
      [activeChallenge.id]: {
        ...currentGameState,
        status: 'in_progress',
      },
    }));
  };

  const handleEndRound = () => {
    setGameStates((prev) => ({
      ...prev,
      [activeChallenge.id]: {
        ...currentGameState,
        status: 'completed',
        hasEndedEarly: true,
      },
    }));

    const isWin = scoreBreakdown.bestGuess?.isWin ?? true;
    const nextStats = calculateNextStats(playerStats, {
      challengeId: activeChallenge.id,
      isWin,
      attemptsUsed: currentGameState.guesses.length,
    });
    setPlayerStats(nextStats);
    savePlayerStats(nextStats);

    trackEvent('game_secured_early_victory', {
      challengeId: activeChallenge.id,
      attemptsCount: currentGameState.guesses.length,
      score: currentGameState.totalScore,
    });

    submitDailyResult({
      challengeId: activeChallenge.id,
      score: currentGameState.totalScore,
      attemptsCount: currentGameState.guesses.length,
      bestGuess: scoreBreakdown.bestGuess?.guessValue || null,
      won: isWin,
    });

    setIsVictoryModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChallenge = (targetChallenge: Challenge) => {
    const idx = challenges.findIndex((c) => c.id === targetChallenge.id);
    if (idx !== -1) {
      setTrainingChallengeIndex(idx);
      setIsVictoryModalOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextChallenge = () => {
    const nextIdx = (trainingChallengeIndex + 1) % challenges.length;
    setTrainingChallengeIndex(nextIdx);
    setIsVictoryModalOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasNextChallenge =
    gameMode === 'training' && trainingChallengeIndex < challenges.length - 1;

  const completedChallengeIds = Object.keys(gameStates).filter(
    (id) => gameStates[id]?.status === 'completed'
  );

  const latestGuess = currentGameState.guesses[currentGameState.guesses.length - 1];
  const latestUnlockedClue = getUnlockedClueInfo(currentGameState.guesses.length);

  const isInputDisabled =
    currentGameState.status === 'completed' ||
    currentGameState.status === 'won_can_continue' ||
    currentGameState.guesses.length >= currentGameState.maxAttempts;

  if (isAdminRoute) {
    return (
      <AdminPage
        onBackToGame={() => {
          if (window.location.hash === '#admin') {
            window.location.hash = '';
          }
          if (window.location.pathname === '/admin') {
            window.history.pushState({}, '', '/');
          }
          setIsAdminRoute(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-amber-500 selection:text-black">
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenLeaderboard={() => {
          setLeaderboardInitialTab('daily');
          setIsLeaderboardOpen(true);
        }}
        dayNumber={dailyChallengeNumber}
        gameMode={gameMode}
        onToggleGameMode={ENABLE_ARCHIVE_MODE ? () => setGameMode((m) => (m === 'daily' ? 'training' : 'daily')) : undefined}
      />

      <main className="flex-1 w-full max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6">
        {/* In Training/Archive Mode: show training banner & vehicle switcher (desabilitado temporariamente) */}
        {ENABLE_ARCHIVE_MODE && gameMode === 'training' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <span className="font-semibold">Arquivo: teste qualquer veículo livremente.</span>
              <button
                type="button"
                onClick={() => setGameMode('daily')}
                className="font-bold underline text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                Voltar ao Diário →
              </button>
            </div>
            <VehicleSelector
              challenges={challenges}
              activeChallengeId={activeChallenge.id}
              completedChallengeIds={completedChallengeIds}
              onSelectChallenge={handleSelectChallenge}
            />
          </div>
        )}

        {/* If Daily Challenge is completed, show Countdown Banner and Weekly Leaderboard Widget */}
        {gameMode === 'daily' && isDailyCompleted && (
          <div className="space-y-4">
            <DailyCountdown
              dayNumber={dailyChallengeNumber}
              onSwitchToTraining={ENABLE_ARCHIVE_MODE ? () => setGameMode('training') : undefined}
              onShareResult={handleShareDaily}
              onOpenResult={() => setIsVictoryModalOpen(true)}
              isCopied={isShareCopied}
              scoreBreakdown={scoreBreakdown}
              askingPrice={dailyChallenge.askingPrice}
              originalUrl={dailyChallenge.originalUrl}
              attemptsUsed={currentGameState.guesses.length}
              maxAttempts={currentGameState.maxAttempts}
            />

            <WeeklyLeaderboardWidget
              onOpenLeaderboard={() => {
                setLeaderboardInitialTab('weekly');
                setIsLeaderboardOpen(true);
              }}
            />
          </div>
        )}

        {/* Clues Stage */}
        <ClueViewer
          key={`clues-${activeChallenge.id}`}
          clues={activeChallenge.clues}
          unlockedCount={unlockedCluesCount}
          isCompleted={currentGameState.status === 'completed'}
          originalUrl={activeChallenge.originalUrl}
          isBalancedLayout={true}
          highContrastLocks={true}
          unlockedClueGlow={true}
          clueDisclosureMode="compact-indicator"
        />

        {/* Inline Feedback Banner (Especially useful in Option A) */}
        {latestGuess && currentGameState.status !== 'completed' && (
          <LastGuessFeedback
            lastGuess={latestGuess}
            attemptNumber={currentGameState.guesses.length}
            unlockedClueLabel={latestUnlockedClue?.label}
            onViewClue={() => {
              if (latestUnlockedClue?.elementId) {
                document.getElementById(latestUnlockedClue.elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />
        )}

        {/* Input Bar: Hidden when round is completed since guessing is finished */}
        {currentGameState.status !== 'completed' && (
          <GuessInput
            key={`guess-${activeChallenge.id}`}
            initialValue={currentGameState.guesses[currentGameState.guesses.length - 1]?.guessValue ?? 0}
            onConfirmGuess={handleConfirmGuess}
            disabled={isInputDisabled}
            useAmberFocus={true}
            currentAttempt={Math.min(currentGameState.guesses.length + 1, currentGameState.maxAttempts)}
            maxAttempts={currentGameState.maxAttempts}
          />
        )}

        {/* Guess History (Wordle Style) */}
        <GuessHistory
          guesses={currentGameState.guesses}
          maxAttempts={currentGameState.maxAttempts}
        />

        {/* Non-intrusive Ad Banner (Desabilitado temporariamente) */}
        {ENABLE_ADS && (
          <AdBannerSlot isCompleted={currentGameState.status === 'completed'} />
        )}
      </main>

      {/* Footer info */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500 space-y-2.5">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setContactInitialTab('suggest');
              setIsContactOpen(true);
            }}
            className="text-zinc-400 hover:text-amber-400 transition cursor-pointer"
          >
            Sugerir Anúncio
          </button>
          <span className="text-zinc-700">•</span>
          <button
            type="button"
            onClick={() => {
              setContactInitialTab('remove');
              setIsContactOpen(true);
            }}
            className="text-zinc-400 hover:text-rose-400 transition cursor-pointer"
          >
            Remover Anúncio
          </button>
          <span className="text-zinc-700">•</span>
          <button
            type="button"
            onClick={() => {
              setContactInitialTab('contact');
              setIsContactOpen(true);
            }}
            className="text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Contato
          </button>
        </div>
        <p className="text-[11px] text-zinc-600 px-4">
          Tá pro Brick • Adivinhe o Preço dos Anúncios • Conteúdo público e educativo • Não afiliado à Tabela Fipe
        </p>
      </footer>

      {/* Modals */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        onClose={() => setIsVictoryModalOpen(false)}
        gameState={currentGameState}
        scoreBreakdown={scoreBreakdown}
        onContinuePlaying={handleContinuePlaying}
        onEndRound={handleEndRound}
        onNextChallenge={handleNextChallenge}
        hasNextChallenge={ENABLE_ARCHIVE_MODE && hasNextChallenge}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenLeaderboard={() => {
          setLeaderboardInitialTab('weekly');
          setIsLeaderboardOpen(true);
        }}
        challengeNumber={gameMode === 'daily' ? dailyChallengeNumber : undefined}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={playerStats}
        currentAttempt={currentGameState.guesses.length}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={handleCloseHelp}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        challengeId={activeChallenge.id}
        hasPlayedToday={currentGameState.status === 'completed' || currentGameState.status === 'won_can_continue'}
        dayNumber={gameMode === 'daily' ? dailyChallengeNumber : undefined}
        initialTab={leaderboardInitialTab}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        initialTab={contactInitialTab}
      />

      <CookieBanner
        onOpenPrivacy={() => {
          setContactInitialTab('contact');
          setIsContactOpen(true);
        }}
      />
    </div>
  );
}

export default App;
