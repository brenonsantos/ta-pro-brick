import { useState } from 'react';
import { Header } from './components/Header';
import { VehicleSelector } from './components/VehicleSelector';
import { ClueViewer } from './components/ClueViewer';
import { GuessHistory } from './components/GuessHistory';
import { GuessInput } from './components/GuessInput';
import { VictoryModal } from './components/VictoryModal';
import { HelpModal } from './components/HelpModal';

import { Challenge, GameState, RoundStatus } from './types/game';
import { GAME_CONFIG } from './config/gameConfig';
import { evaluateGuess, calculateScore } from './utils/gameLogic';
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

export function App() {
  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number>(0);
  const [gameStates, setGameStates] = useState<Record<string, GameState>>(() => {
    const initial: Record<string, GameState> = {};
    challenges.forEach((c) => {
      initial[c.id] = createInitialGameState(c);
    });
    return initial;
  });

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
  };

  const handleRestartCurrentRound = () => {
    setGameStates((prev) => ({
      ...prev,
      [activeChallenge.id]: createInitialGameState(activeChallenge),
    }));
  };

  const handleSelectChallenge = (targetChallenge: Challenge) => {
    const idx = challenges.findIndex((c) => c.id === targetChallenge.id);
    if (idx !== -1) {
      setActiveChallengeIndex(idx);
    }
  };

  const handleNextChallenge = () => {
    const nextIdx = (activeChallengeIndex + 1) % challenges.length;
    setActiveChallengeIndex(nextIdx);
  };

  const hasNextChallenge = activeChallengeIndex < challenges.length - 1;

  const completedChallengeIds = Object.keys(gameStates).filter(
    (id) => gameStates[id]?.status === 'completed'
  );

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
          clues={activeChallenge.clues}
          unlockedCount={unlockedCluesCount}
          isCompleted={currentGameState.status === 'completed'}
          originalUrl={activeChallenge.originalUrl}
        />

        {/* Input Bar */}
        <GuessInput
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
        <p>Tá pro Brick • Protótipo de Validação • 5 Carros de Teste • Não afiliado à tabela FIPE</p>
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
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={handleCloseHelp}
      />
    </div>
  );
}

export default App;
