import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
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
import { submitDailyResult } from './services/rankingService';

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
import { generateShareText } from './utils/shareText';
import { DailyCountdown } from './components/DailyCountdown';
import mockChallengesData from './data/mockChallenges.json';

const challenges: Challenge[] = mockChallengesData as Challenge[];
const ONBOARDING_STORAGE_KEY = 'taprobrick_has_seen_onboarding';

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
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

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

  const todayDateStr = getTodayDateString();
  const dailyChallengeIndex = getDailyChallengeIndex(challenges.length, todayDateStr);
  const dailyChallengeNumber = getDailyChallengeNumber(todayDateStr);
  const dailyChallenge = challenges[dailyChallengeIndex] || challenges[0];

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

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setIsShareCopied(true);
        setTimeout(() => setIsShareCopied(false), 2500);
      }
    } catch {
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

      submitDailyResult({
        challengeId: activeChallenge.id,
        score: updatedScore.totalScore,
        attemptsCount: updatedGuesses.length,
        bestGuess: updatedScore.bestGuess?.guessValue || null,
        won: isWin,
      });

      setIsVictoryModalOpen(true);
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

    submitDailyResult({
      challengeId: activeChallenge.id,
      score: currentGameState.totalScore,
      attemptsCount: currentGameState.guesses.length,
      bestGuess: scoreBreakdown.bestGuess?.guessValue || null,
      won: isWin,
    });

    setIsVictoryModalOpen(true);
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
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        dayNumber={dailyChallengeNumber}
        gameMode={gameMode}
        onToggleGameMode={() => setGameMode((m) => (m === 'daily' ? 'training' : 'daily'))}
      />

      <main className="flex-1 w-full max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6">
        {/* In Training Mode: show training banner & vehicle switcher */}
        {gameMode === 'training' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <span className="font-semibold">Modo Garagem: teste qualquer veículo livremente.</span>
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

        {/* If Daily Challenge is completed, show the Countdown Banner */}
        {gameMode === 'daily' && isDailyCompleted && (
          <DailyCountdown
            dayNumber={dailyChallengeNumber}
            onSwitchToTraining={() => setGameMode('training')}
            onShareResult={handleShareDaily}
            onOpenResult={() => setIsVictoryModalOpen(true)}
            isCopied={isShareCopied}
          />
        )}

        {/* Floating/Inline button to reopen result if user dismissed modal */}
        {currentGameState.status === 'completed' && !isVictoryModalOpen && (
          <div className="flex justify-center animate-in fade-in">
            <button
              type="button"
              onClick={() => setIsVictoryModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer shadow-lg"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              Ver Resultado da Rodada 🏆
            </button>
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

        {/* Input Bar */}
        <GuessInput
          key={`guess-${activeChallenge.id}`}
          initialValue={currentGameState.guesses[currentGameState.guesses.length - 1]?.guessValue ?? 0}
          onConfirmGuess={handleConfirmGuess}
          disabled={isInputDisabled}
          useAmberFocus={true}
          currentAttempt={Math.min(currentGameState.guesses.length + 1, currentGameState.maxAttempts)}
          maxAttempts={currentGameState.maxAttempts}
        />

        {/* Guess History (Wordle Style) */}
        <GuessHistory
          guesses={currentGameState.guesses}
          maxAttempts={currentGameState.maxAttempts}
        />
      </main>

      {/* Footer info */}
      <footer className="border-t border-zinc-900 py-4 text-center text-xs text-zinc-600 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
        <p>Tá pro Brick • Adivinhe o Preço dos Anúncios • Não afiliado à Tabela Fipe</p>
        <span className="hidden sm:inline text-zinc-800">•</span>
        <a
          href="#admin"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = 'admin';
            setIsAdminRoute(true);
          }}
          className="text-zinc-600 hover:text-amber-400/80 transition cursor-pointer"
        >
          Curadoria / Admin
        </a>
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
        hasNextChallenge={hasNextChallenge}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
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
      />
    </div>
  );
}

export default App;
