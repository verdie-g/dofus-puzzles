import { ref, computed } from 'vue';
import type { RushModeState } from '~/models/rush-mode';
import { RUSH_MODE_CONFIG, RushModeType } from '~/models/rush-mode';

const rushModeState = ref<RushModeState>({
  isActive: false,
  score: 0,
  streak: 0,
  lives: RUSH_MODE_CONFIG.MAX_LIVES,
  maxLives: RUSH_MODE_CONFIG.MAX_LIVES,
  startTime: null,
  timeRemaining: RUSH_MODE_CONFIG.COUNTDOWN_TIMES[RushModeType.THREE_MINUTES],
  puzzlesSolved: 0,
  puzzlesFailed: 0,
  showScoreSummary: false,
  bestStreak: 0,
  mode: RushModeType.THREE_MINUTES,
});

let timerInterval: ReturnType<typeof setInterval> | null = null;

export const useRushMode = () => {
  const isRushMode = computed(() => rushModeState.value.isActive);
  const isGameOver = computed(() =>
    rushModeState.value.lives <= 0 ||
    (rushModeState.value.mode !== RushModeType.SURVIVE && rushModeState.value.timeRemaining <= 0)
  );
  const showScoreSummary = computed(() => rushModeState.value.showScoreSummary);
  const isSurviveMode = computed(() => rushModeState.value.mode === RushModeType.SURVIVE);

  const startRushMode = (mode: RushModeType = RushModeType.THREE_MINUTES) => {
    const countdownTime = RUSH_MODE_CONFIG.COUNTDOWN_TIMES[mode];

    rushModeState.value = {
      isActive: true,
      score: 0,
      streak: 0,
      lives: RUSH_MODE_CONFIG.MAX_LIVES,
      maxLives: RUSH_MODE_CONFIG.MAX_LIVES,
      startTime: Date.now(),
      timeRemaining: countdownTime,
      puzzlesSolved: 0,
      puzzlesFailed: 0,
      showScoreSummary: false,
      bestStreak: 0,
      mode: mode,
    };

    // Start countdown timer (only if not survive mode)
    if (mode !== RushModeType.SURVIVE) {
      timerInterval = setInterval(() => {
        if (rushModeState.value.startTime && rushModeState.value.timeRemaining > 0) {
          const elapsed = Date.now() - rushModeState.value.startTime;
          rushModeState.value.timeRemaining = Math.max(
            0,
            countdownTime - elapsed
          );

          if (rushModeState.value.timeRemaining <= 0) {
            endGame();
          }
        }
      }, 100);
    }
  };

  const endGame = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    rushModeState.value.showScoreSummary = true;
  };

  const stopRushMode = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    rushModeState.value.isActive = false;
    rushModeState.value.showScoreSummary = false;
  };

  const calculatePoints = (streak: number): number => {
    if (streak === 0) {
      return RUSH_MODE_CONFIG.BASE_POINTS;
    }
    return Math.floor(RUSH_MODE_CONFIG.BASE_POINTS * (1 + streak * RUSH_MODE_CONFIG.STREAK_MULTIPLIER));
  };

  const onPuzzleSuccess = () => {
    rushModeState.value.puzzlesSolved++;
    rushModeState.value.streak++;

    if (rushModeState.value.streak > rushModeState.value.bestStreak) {
      rushModeState.value.bestStreak = rushModeState.value.streak;
    }

    const points = calculatePoints(rushModeState.value.streak - 1);
    rushModeState.value.score += points;
  };

  const onPuzzleFailure = () => {
    rushModeState.value.puzzlesFailed++;
    rushModeState.value.streak = 0;
    rushModeState.value.lives--;

    if (rushModeState.value.lives <= 0) {
      endGame();
    }
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentStreakBonus = (): number => {
    return calculatePoints(rushModeState.value.streak);
  };
  return {
    rushModeState: computed(() => rushModeState.value),
    isRushMode,
    isGameOver,
    showScoreSummary,
    isSurviveMode,
    startRushMode,
    stopRushMode,
    onPuzzleSuccess,
    onPuzzleFailure,
    formatTime,
    getCurrentStreakBonus
  };
};
