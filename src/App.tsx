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

import { Challenge, GameState, RoundStatus } from './types/game';
import { GAME_CONFIG } from './config/gameConfig';
import { evaluateGuess, calculateScore } from './utils/gameLogic';
import {
  loadPlayerStats,
  savePlayerStats,
  loadSavedGameStates,
  saveGameStates,
  calculateNextStats,
  PlayerStats,
} from './utils/statsManager';
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
  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number>(0);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => loadPlayerStats());
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);

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

  const activeChallenge = challenges[activeChallengeIndex] || challenges[0];
  const currentGameState = gameStates[activeChallenge.id] || createInitialGameState(activeChallenge);

  const handleCloseHelp = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {
      // Ignore in private storage environments
    }
    setIsHelpOpen(false);
  };

  // Remaining unused attempts
  const remainingAttempts = currentGameState.maxAttempts - currentGameState.guesses.length;

  // Clues unlocked: starts at 1, increases with each guess up to 5
  const unlockedCluesCount = Math.min(5, currentGameState.guesses.length + 1);

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
      return;
    }

    if (nextStatus === 'won_can_continue') {
      // Modal will trigger; keep in place
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
  };

  const handleRestartCurrentRound = () => {
    setGameStates((prev) => ({
      ...prev,
      [activeChallenge.id]: createInitialGameState(activeChallenge),
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChallenge = (targetChallenge: Challenge) => {
    const idx = challenges.findIndex((c) => c.id === targetChallenge.id);
    if (idx !== -1) {
      setActiveChallengeIndex(idx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextChallenge = () => {
    const nextIdx = (activeChallengeIndex + 1) % challenges.length;
    setActiveChallengeIndex(nextIdx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasNextChallenge = activeChallengeIndex < challenges.length - 1;

  const completedChallengeIds = Object.keys(gameStates).filter(
    (id) => gameStates[id]?.status === 'completed'
  );

  const latestGuess = currentGameState.guesses[currentGameState.guesses.length - 1];
  const latestUnlockedClue = getUnlockedClueInfo(currentGameState.guesses.length);

  const isInputDisabled =
    currentGameState.status === 'completed' ||
    currentGameState.status === 'won_can_continue' ||
    currentGameState.guesses.length >= currentGameState.maxAttempts;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-amber-500 selection:text-black">
      <Header
        currentAttempt={currentGameState.guesses.length + 1}
        maxAttempts={currentGameState.maxAttempts}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      <main className="flex-1 w-full max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6">

        {/* Multi-vehicle quick switcher */}
        <VehicleSelector
          challenges={challenges}
          activeChallengeId={activeChallenge.id}
          completedChallengeIds={completedChallengeIds}
          onSelectChallenge={handleSelectChallenge}
        />

        {/* Clues Stage */}
        <ClueViewer
          key={`clues-${activeChallenge.id}`}
          clues={activeChallenge.clues}
          unlockedCount={unlockedCluesCount}
          isCompleted={currentGameState.status === 'completed'}
          originalUrl={activeChallenge.originalUrl}
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
        />

        {/* Guess History (Wordle Style) */}
        <GuessHistory
          guesses={currentGameState.guesses}
          maxAttempts={currentGameState.maxAttempts}
        />
      </main>

      {/* Footer info */}
      <footer className="border-t border-zinc-900 py-4 text-center text-xs text-zinc-600">
        <p>Tá pro Brick • Adivinhe o Preço dos Anúncios • Não afiliado à Tabela Fipe</p>
      </footer>

      {/* Modals */}
      <VictoryModal
        gameState={currentGameState}
        scoreBreakdown={scoreBreakdown}
        onContinuePlaying={handleContinuePlaying}
        onEndRound={handleEndRound}
        onRestartPrototype={handleRestartCurrentRound}
        onNextChallenge={handleNextChallenge}
        hasNextChallenge={hasNextChallenge}
        onOpenStats={() => setIsStatsOpen(true)}
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
    </div>
  );
}

export default App;
