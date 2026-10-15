import { useState } from 'react';
import { Header } from './components/Header';
import { VehicleSelector } from './components/VehicleSelector';
import { ClueViewer } from './components/ClueViewer';
import { GuessHistory } from './components/GuessHistory';
import { GuessInput } from './components/GuessInput';
import { VictoryModal } from './components/VictoryModal';
import { HelpModal } from './components/HelpModal';
import { LastGuessFeedback } from './components/LastGuessFeedback';
import { StickyGuessHud } from './components/StickyGuessHud';

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
  const [feedbackFlowMode, setFeedbackFlowMode] = useState<'A' | 'B'>('A');
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

    if (nextStatus === 'completed' || nextStatus === 'won_can_continue') {
      // Modal will trigger; keep in place
      return;
    }

    // Handle Option A vs Option B flow:
    if (feedbackFlowMode === 'B') {
      // Option B: scroll to newly unlocked clue
      const clueInfo = getUnlockedClueInfo(updatedGuesses.length);
      if (clueInfo?.elementId) {
        setTimeout(() => {
          document.getElementById(clueInfo.elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
    // Option A keeps player in place at the input and displays LastGuessFeedback directly above it!
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
      {/* Option B: Sticky HUD when viewing clues */}
      {feedbackFlowMode === 'B' && latestGuess && currentGameState.status !== 'completed' && (
        <StickyGuessHud
          lastGuess={latestGuess}
          attemptNumber={currentGameState.guesses.length}
          onScrollToInput={() => {
            document.getElementById('guess-input-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      )}

      <Header
        currentAttempt={currentGameState.guesses.length + 1}
        maxAttempts={currentGameState.maxAttempts}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <main className="flex-1 w-full max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6">
        {/* Prototype UX Comparison Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-zinc-300">
          <span className="font-bold text-amber-300">Modo de Teste UX:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFeedbackFlowMode('A')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                feedbackFlowMode === 'A'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Opção A (Sem Scroll + Card)
            </button>
            <button
              type="button"
              onClick={() => setFeedbackFlowMode('B')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                feedbackFlowMode === 'B'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Opção B (Scroll na Pista + Barra Fixa)
            </button>
          </div>
        </div>

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
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={handleCloseHelp}
      />
    </div>
  );
}

export default App;
