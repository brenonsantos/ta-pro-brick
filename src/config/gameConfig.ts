export interface GameConfig {
  maxAttempts: number;
  tolerances: {
    standardWinMargin: number; // 0.05 = 5%
    minFloorAmount: number;    // R$ 1000.00 floor for low-value cars
    bullseyeMargin: number;    // 0.01 = 1%
    exactMarginAmount: number; // R$ 1.00
    hotMargin: number;         // 0.20 = 20%
    warmMargin: number;        // 0.50 = 50%
  };
  scoring: {
    exactBasePoints: number;
    bullseyeBasePoints: number;
    standardWinBasePoints: number;
    maxLossPoints: number;
    pointsPerUnusedAttempt: number;
  };
}

export const GAME_CONFIG: GameConfig = {
  maxAttempts: 6,
  tolerances: {
    standardWinMargin: 0.05,
    minFloorAmount: 1000,
    bullseyeMargin: 0.01,
    exactMarginAmount: 1,
    hotMargin: 0.20,
    warmMargin: 0.50,
  },
  scoring: {
    exactBasePoints: 10000,
    bullseyeBasePoints: 8500,
    standardWinBasePoints: 6000,
    maxLossPoints: 3000,
    pointsPerUnusedAttempt: 500,
  },
};
