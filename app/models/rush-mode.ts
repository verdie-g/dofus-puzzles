export interface RushModeState {
  isActive: boolean;
  score: number;
  streak: number;
  lives: number;
  maxLives: number;
  startTime: number | null;
  timeRemaining: number;
  puzzlesSolved: number;
  puzzlesFailed: number;
  showScoreSummary: boolean;
  bestStreak: number;
  mode: RushModeType;
}

export enum RushModeType {
  ONE_MINUTE = '1min',
  THREE_MINUTES = '3min',
  FIVE_MINUTES = '5min',
  SURVIVE = 'survive',
}

export const RUSH_MODE_CONFIG = {
  MAX_LIVES: 3,
  COUNTDOWN_TIMES: {
    [RushModeType.ONE_MINUTE]: 60000,
    [RushModeType.THREE_MINUTES]: 180000,
    [RushModeType.FIVE_MINUTES]: 300000,
    [RushModeType.SURVIVE]: Infinity, // No time limit
  },
  BASE_POINTS: 25,
  STREAK_MULTIPLIER: 1.5
} as const;
