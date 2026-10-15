import { Direction, GuessEvaluation, HeatBand, VictoryTier } from '../types/game';
import { GameConfig, GAME_CONFIG } from '../config/gameConfig';

/**
 * Evaluates a user guess against the seller's asking price.
 */
export function evaluateGuess(
  guessValue: number,
  askingPrice: number,
  config: GameConfig = GAME_CONFIG
): GuessEvaluation {
  const absoluteDifference = Math.abs(guessValue - askingPrice);
  const errorPercentage = askingPrice > 0 ? absoluteDifference / askingPrice : 1;

  let direction: Direction = 'exact';
  if (guessValue < askingPrice) {
    direction = 'higher';
  } else if (guessValue > askingPrice) {
    direction = 'lower';
  }

  // Determine victory tier
  const isExact = absoluteDifference <= config.tolerances.exactMarginAmount;
  const isBullseye = errorPercentage <= config.tolerances.bullseyeMargin;

  // Floor margin for low-value vehicles, capped at 10% of asking price to prevent excessive tolerance on cheap parts/wheels
  const effectiveFloor = Math.min(config.tolerances.minFloorAmount, askingPrice * 0.10);
  const isStandardWin =
    errorPercentage <= config.tolerances.standardWinMargin ||
    (effectiveFloor > 0 && absoluteDifference <= effectiveFloor);

  const isWin = isExact || isBullseye || isStandardWin;

  let tier: VictoryTier | undefined = undefined;
  if (isExact) {
    tier = 'exact';
  } else if (isBullseye) {
    tier = 'bullseye';
  } else if (isWin) {
    tier = 'standard';
  }

  // Determine heat band
  let heatBand: HeatBand = 'freezing';
  if (isExact) {
    heatBand = 'exact';
  } else if (isBullseye) {
    heatBand = 'bullseye';
  } else if (isWin) {
    heatBand = 'win';
  } else if (errorPercentage <= config.tolerances.hotMargin) {
    heatBand = 'hot';
  } else if (errorPercentage <= config.tolerances.warmMargin) {
    heatBand = 'warm';
  } else {
    heatBand = 'freezing';
  }

  return {
    guessValue,
    direction,
    heatBand,
    errorPercentage,
    absoluteDifference,
    isWin,
    tier,
  };
}

export interface ScoreBreakdown {
  totalScore: number;
  baseScore: number;
  bonusScore: number;
  bestGuess: GuessEvaluation | null;
  tier?: VictoryTier;
}

/**
 * Calculates current round score based on the best guess and remaining attempts.
 */
export function calculateScore(
  guesses: GuessEvaluation[],
  remainingAttempts: number,
  config: GameConfig = GAME_CONFIG
): ScoreBreakdown {
  if (guesses.length === 0) {
    return { totalScore: 0, baseScore: 0, bonusScore: 0, bestGuess: null };
  }

  // Find the best guess (lowest absolute difference)
  const bestGuess = guesses.reduce((best, current) => {
    return current.absoluteDifference < best.absoluteDifference ? current : best;
  }, guesses[0]);

  let baseScore = 0;
  let bonusScore = 0;

  if (bestGuess.isWin) {
    if (bestGuess.tier === 'exact') {
      baseScore = config.scoring.exactBasePoints;
    } else if (bestGuess.tier === 'bullseye') {
      baseScore = config.scoring.bullseyeBasePoints;
    } else {
      baseScore = config.scoring.standardWinBasePoints;
    }

    bonusScore = Math.max(0, remainingAttempts) * config.scoring.pointsPerUnusedAttempt;
  } else {
    // Proportional score up to maxLossPoints for close loss
    const closenessRatio = Math.max(0, 1 - bestGuess.errorPercentage);
    baseScore = Math.round(closenessRatio * config.scoring.maxLossPoints);
    bonusScore = 0;
  }

  return {
    totalScore: baseScore + bonusScore,
    baseScore,
    bonusScore,
    bestGuess,
    tier: bestGuess.tier,
  };
}
