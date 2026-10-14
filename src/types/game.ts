export type Direction = 'higher' | 'lower' | 'exact';

export type HeatBand = 'freezing' | 'warm' | 'hot' | 'win' | 'bullseye' | 'exact';

export type VictoryTier = 'standard' | 'bullseye' | 'exact';

export type RoundStatus = 'in_progress' | 'won_can_continue' | 'completed';

export interface ClueItem {
  id: number;
  attemptNumber: number;
  label: string;
  type: 'title_and_cover' | 'gallery' | 'description' | 'location' | 'time';
  content: {
    title?: string;
    coverImageUrl?: string;
    images?: string[];
    description?: string;
    location?: {
      city: string;
      state: string;
    };
    timeOnMarket?: string;
  };
}

export interface Challenge {
  id: string;
  title: string;
  shortName?: string;
  askingPrice: number;
  clues: ClueItem[];
  originalUrl?: string;
}

export interface GuessEvaluation {
  guessValue: number;
  direction: Direction;
  heatBand: HeatBand;
  errorPercentage: number;
  absoluteDifference: number;
  isWin: boolean;
  tier?: VictoryTier;
}

export interface GameState {
  challenge: Challenge;
  guesses: GuessEvaluation[];
  maxAttempts: number;
  status: RoundStatus;
  bestGuess: GuessEvaluation | null;
  totalScore: number;
  hasEndedEarly: boolean;
}
