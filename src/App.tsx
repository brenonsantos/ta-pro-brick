import { useState } from 'react';
import { Header } from './components/Header';
import { ClueViewer } from './components/ClueViewer';
import { GuessHistory } from './components/GuessHistory';
import { GuessInput } from './components/GuessInput';
import { VictoryModal } from './components/VictoryModal';
import { HelpModal } from './components/HelpModal';

import { Challenge, GameState, RoundStatus } from './types/game';
import { GAME_CONFIG } from './config/gameConfig';
import { evaluateGuess, calculateScore } from './utils/gameLogic';
import mockChallengeData from './data/mockChallenge.json';

const initialChallenge: Challenge = mockChallengeData as Challenge;

export function App() {
  const [challenge] = useState<Challenge>(initialChallenge);
  const [gameState, setGameState] = useState<GameState>({
    challenge: initialChallenge,
    guesses: [],
    maxAttempts: GAME_CONFIG.maxAttempts,
    status: 'in_progress',
    bestGuess: null,
    totalScore: 0,
    hasEndedEarly: false,
  });

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Remaining unused attempts
  const remainingAttempts = gameState.maxAttempts - gameState.guesses.length;

  // Clues unlocked: starts at 1, increases with each guess up to 5
  const unlockedCluesCount = Math.min(5, gameState.guesses.length + 1);

  // Current score breakdown
  const scoreBreakdown = calculateScore(
    gameState.guesses,
    remainingAttempts,
    GAME_CONFIG
  );

  const handleConfirmGuess = (guessValue: number) => {
    if (gameState.status === 'completed') return;

    const evaluation = evaluateGuess(guessValue, challenge.askingPrice, GAME_CONFIG);
    const updatedGuesses = [...gameState.guesses, evaluation];
    const newRemainingAttempts = gameState.maxAttempts - updatedGuesses.length;

    let nextStatus: RoundStatus = 'in_progress';

    if (evaluation.heatBand === 'exact') {
      // Exact hit: immediately completed with highest honors!
      nextStatus = 'completed';
    } else if (evaluation.isWin && newRemainingAttempts > 0) {
      // Won with attempts left: prompt choice to stop or continue
      nextStatus = 'won_can_continue';
    } else if (updatedGuesses.length >= gameState.maxAttempts) {
      // All 6 attempts exhausted
      nextStatus = 'completed';
    }

    const updatedScore = calculateScore(updatedGuesses, newRemainingAttempts, GAME_CONFIG);

    setGameState((prev) => ({
      ...prev,
      guesses: updatedGuesses,
      status: nextStatus,
      bestGuess: updatedScore.bestGuess,
      totalScore: updatedScore.totalScore,
    }));
  };

  const handleContinuePlaying = () => {
    setGameState((prev) => ({
      ...prev,
      status: 'in_progress',
    }));
  };

  const handleEndRound = () => {
    setGameState((prev) => ({
      ...prev,
      status: 'completed',
      hasEndedEarly: true,
    }));
  };

  const handleRestartPrototype = () => {
    setGameState({
      challenge,
      guesses: [],
      maxAttempts: GAME_CONFIG.maxAttempts,
      status: 'in_progress',
      bestGuess: null,
      totalScore: 0,
      hasEndedEarly: false,
    });
  };

  const isInputDisabled =
    gameState.status === 'completed' ||
    gameState.status === 'won_can_continue' ||
    gameState.guesses.length >= gameState.maxAttempts;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-amber-500 selection:text-black">
      <Header
        currentAttempt={gameState.guesses.length + 1}
        maxAttempts={gameState.maxAttempts}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-5 space-y-6">
        {/* Clues Stage */}
        <ClueViewer
          clues={challenge.clues}
          unlockedCount={unlockedCluesCount}
        />

        {/* Input Bar */}
        <GuessInput
          onConfirmGuess={handleConfirmGuess}
          disabled={isInputDisabled}
        />

        {/* Guess History (Wordle Style) */}
        <GuessHistory
          guesses={gameState.guesses}
          maxAttempts={gameState.maxAttempts}
        />
      </main>

      {/* Footer info */}
      <footer className="border-t border-zinc-900 py-4 text-center text-xs text-zinc-600">
        <p>Tá pro Brick • Protótipo Experimental • Não afiliado à tabela FIPE</p>
      </footer>

      {/* Modals */}
      <VictoryModal
        gameState={gameState}
        scoreBreakdown={scoreBreakdown}
        onContinuePlaying={handleContinuePlaying}
        onEndRound={handleEndRound}
        onRestartPrototype={handleRestartPrototype}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default App;
