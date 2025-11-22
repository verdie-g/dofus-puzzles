<script setup lang="ts">
import type { Puzzle, PuzzleResult } from '@/models/puzzle';
import { RushModeType } from '@/models/rush-mode';
import { getPuzzles } from '~/services/puzzle-repository';

const { t } = useI18n();

useSeoMeta({
  title: t('seo.index.title'),
  ogTitle: t('seo.index.title'),
  description: t('seo.index.description'),
  ogDescription: t('seo.index.description'),
});

const puzzles = getPuzzles();
arrayShuffle(puzzles);

const puzzle: Ref<Puzzle> = ref(puzzles[0]!);
const puzzleResult: Ref<PuzzleResult | null> = ref(null);
const playing: Ref<boolean> = ref(true);
const showModeSelection: Ref<boolean> = ref(false);

// Rush Mode
const {
  rushModeState,
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
} = useRushMode();

// TODO: how to type that?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProps: Ref<any> = ref({
  puzzle,
  showLineOfSight: false,
  showWinningCells: false,
  showMovement: true,
  highlightCell: null,
});

function onPuzzleCompleted(r: PuzzleResult) {
  if (!playing.value) {
    return;
  }

  try {
    umami.track('puzzle-completed', {
      puzzleId: puzzle.value.id,
      success: r.success,
      rushMode: isRushMode.value,
    });
  } catch {}

  playing.value = false;
  puzzleResult.value = r;
  mapProps.value.showLineOfSight = true;
  mapProps.value.showWinningCells = true;
  mapProps.value.showMovement = false;
  mapProps.value.highlightCell = r.cellId;

  // Handle Rush Mode scoring
  if (isRushMode.value && !isGameOver.value) {
    if (r.success) {
      onPuzzleSuccess();
    } else {
      onPuzzleFailure();
    }
  }
}

function onNextPuzzle() {
  if (playing.value) {
    return;
  }

  if (isRushMode.value && isGameOver.value) {
    return;
  }

  playing.value = true;
  puzzleResult.value = null;
  mapProps.value.showLineOfSight = false;
  mapProps.value.showWinningCells = false;
  mapProps.value.showMovement = true;
  mapProps.value.highlightCell = null;
  
  const puzzleIdx = puzzles.findIndex(p => p.id === puzzle.value.id);
  if (puzzleIdx === puzzles.length - 1) {
    arrayShuffle(puzzles);
    puzzle.value = puzzles[0]!;
  } else {
    puzzle.value = puzzles[puzzleIdx + 1]!;
  }
}

function toggleRushMode() {
  if (isRushMode.value) {
    stopRushMode();
    showModeSelection.value = false;
    // Reset to normal mode
    playing.value = true;
    puzzleResult.value = null;
    mapProps.value.showLineOfSight = false;
    mapProps.value.showWinningCells = false;
    mapProps.value.showMovement = true;
    mapProps.value.highlightCell = null;
  } else {
    showModeSelection.value = true;
  }
}

function selectMode(mode: RushModeType) {
  showModeSelection.value = false;
  startRushMode(mode);
  // Reset puzzle
  arrayShuffle(puzzles);
  puzzle.value = puzzles[0]!;
  playing.value = true;
  puzzleResult.value = null;
  mapProps.value.showLineOfSight = false;
  mapProps.value.showWinningCells = false;
  mapProps.value.showMovement = true;
  mapProps.value.highlightCell = null;
}

function restartRushMode() {
  // Restart rush mode with same mode
  startRushMode(rushModeState.value.mode);
  arrayShuffle(puzzles);
  puzzle.value = puzzles[0]!;
  playing.value = true;
  puzzleResult.value = null;
  mapProps.value.showLineOfSight = false;
  mapProps.value.showWinningCells = false;
  mapProps.value.showMovement = true;
  mapProps.value.highlightCell = null;
}

function returnToMenu() {
  stopRushMode();
  showModeSelection.value = false;
  // Reset to normal mode
  playing.value = true;
  puzzleResult.value = null;
  mapProps.value.showLineOfSight = false;
  mapProps.value.showWinningCells = false;
  mapProps.value.showMovement = true;
  mapProps.value.highlightCell = null;
  arrayShuffle(puzzles);
  puzzle.value = puzzles[0]!;
}

// Computed property for timer color based on remaining time
const timerColor = computed(() => {
  const remaining = rushModeState.value.timeRemaining;
  if (remaining <= 30000) return 'text-yellow-300 font-extrabold animate-pulse'; // Less than 30 seconds - bright yellow with pulse
  if (remaining <= 60000) return 'text-orange-300 font-bold'; // Less than 1 minute - bright orange
  return 'text-white';
});

// Computed property for streak bonus display
const streakBonusText = computed(() => {
  const bonus = getCurrentStreakBonus();
  return `+${bonus}`;
});

// Get mode display name
const getModeDisplayName = (mode: RushModeType): string => {
  return t(`rushMode.modes.${mode}`);
};
</script>

<template>
  <div>
    <UContainer>
      <!-- Mode Selection Modal -->
      <div v-if="showModeSelection" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg p-8 max-w-2xl w-full text-white">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-bold">{{ $t('rushMode.selectMode') }}</h2>
            <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                @click="showModeSelection = false"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button @click="selectMode(RushModeType.ONE_MINUTE)" class="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-lg p-6 text-left transition-all transform hover:scale-105">
              <span class="block text-2xl font-bold mb-2">⚡ {{ getModeDisplayName(RushModeType.ONE_MINUTE) }}</span>
              <span class="block text-sm opacity-90">{{ $t('rushMode.modeDescriptions.1min') }}</span>
            </button>

            <button @click="selectMode(RushModeType.THREE_MINUTES)" class="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 rounded-lg p-6 text-left transition-all transform hover:scale-105">
              <span class="block text-2xl font-bold mb-2">🔥 {{ getModeDisplayName(RushModeType.THREE_MINUTES) }}</span>
              <span class="block text-sm opacity-90">{{ $t('rushMode.modeDescriptions.3min') }}</span>
            </button>

            <button @click="selectMode(RushModeType.FIVE_MINUTES)" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg p-6 text-left transition-all transform hover:scale-105">
              <span class="block text-2xl font-bold mb-2">💪 {{ getModeDisplayName(RushModeType.FIVE_MINUTES) }}</span>
              <span class="block text-sm opacity-90">{{ $t('rushMode.modeDescriptions.5min') }}</span>
            </button>

            <button @click="selectMode(RushModeType.SURVIVE)" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg p-6 text-left transition-all transform hover:scale-105">
              <span class="block text-2xl font-bold mb-2">💀 {{ getModeDisplayName(RushModeType.SURVIVE) }}</span>
              <span class="block text-sm opacity-90">{{ $t('rushMode.modeDescriptions.survive') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Rush Mode Header (only show if not showing score summary) -->
      <div v-if="isRushMode && !showScoreSummary" class="my-4 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white">
        <div class="flex justify-between items-center mb-4">
          <div class="text-2xl font-bold">
            🔥 {{ $t('rushMode.title') }} - {{ getModeDisplayName(rushModeState.mode) }}
          </div>
          <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="toggleRushMode"
          >
            {{ $t('rushMode.exitButton') }}
          </UButton>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-center">
        <div>
            <div class="text-sm opacity-90">{{ $t('rushMode.score') }}</div>
            <div class="text-3xl font-bold">{{ rushModeState.score }}</div>
          </div>
          <div>
            <div class="text-sm opacity-90">{{ $t('rushMode.streak') }}</div>
            <div class="text-3xl font-bold">
              🔥 {{ rushModeState.streak }}
              <span v-if="rushModeState.streak > 0" class="text-lg text-yellow-300 ml-1">
                ({{ streakBonusText }})
              </span>
            </div>
          </div>
          <div>
            <div class="text-sm opacity-90">{{ $t('rushMode.lives') }}</div>
            <div class="text-3xl font-bold">
              <span v-for="i in rushModeState.maxLives" :key="i">
                {{ i <= rushModeState.lives ? '❤️' : '🖤' }}
              </span>
            </div>
          </div>
          <div v-if="!isSurviveMode">
            <div class="text-sm opacity-90">{{ $t('rushMode.time') }}</div>
            <div class="text-3xl font-bold" :class="timerColor">
              ⏱️ {{ formatTime(rushModeState.timeRemaining) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Score Summary Screen (shown when game ends) -->
      <div v-if="isRushMode && showScoreSummary" class="my-4 p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg text-white text-center shadow-2xl">
        <div class="text-5xl font-bold mb-6">
          {{ rushModeState.lives <= 0 ? '💀' : '⏰' }} {{ $t('rushMode.gameOver') }}
        </div>

        <div class="text-xl mb-4 opacity-75">{{ getModeDisplayName(rushModeState.mode) }}</div>
          <div class="text-6xl font-bold mb-6 text-yellow-400">{{ rushModeState.score }}</div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xl mb-6">
        <div class="bg-green-500 bg-opacity-20 rounded-lg p-4 border-2 border-green-500">
              <div class="text-sm opacity-75 mb-2">{{ $t('rushMode.correct') }}</div>
              <div class="text-4xl font-bold">✅ {{ rushModeState.puzzlesSolved }}</div>
            </div>

            <div class="bg-red-500 bg-opacity-20 rounded-lg p-4 border-2 border-red-500">
              <div class="text-sm opacity-75 mb-2">{{ $t('rushMode.wrong') }}</div>
              <div class="text-4xl font-bold">❌ {{ rushModeState.puzzlesFailed }}</div>
            </div>

            <div class="bg-orange-500 bg-opacity-20 rounded-lg p-4 border-2 border-orange-500">
              <div class="text-sm opacity-75 mb-2">{{ $t('rushMode.bestStreak') }}</div>
              <div class="text-4xl font-bold">🔥 {{ rushModeState.bestStreak }}</div>
            </div>
          </div>

        <div class="flex gap-4 justify-center flex-wrap">
          <UButton
              icon="i-lucide-rotate-ccw"
              size="lg"
              color="primary"
              @click="restartRushMode"
          >
            {{ $t('rushMode.playAgain') }}
          </UButton>

          <UButton
              icon="i-lucide-home"
              size="lg"
              color="neutral"
              @click="returnToMenu"
          >
            {{ $t('rushMode.backToMenu') }}
          </UButton>
        </div>
      </div>

      <i18n-t v-if="!isRushMode" keypath="puzzle.rules.main" tag="p" class="mt-2 text-xl text-center">
        <template #ally>
          <span class="text-[#15518F]">{{ $t('puzzle.rules.you') }}</span>
        </template>
        <template #enemy>
          <span class="text-[#eb2b2b]">{{ $t('puzzle.rules.enemy') }}</span>
        </template>
        <template #obstacles>
          <span class="text-[#60314f]">{{ $t('puzzle.rules.obstacles') }}</span>
        </template>
      </i18n-t>
      <div class="my-2 flex justify-center" :class="{ invisible: playing || showScoreSummary }">
        <UButton trailing-icon="i-lucide-arrow-right" size="md" :color="puzzleResult?.success ? 'success' : 'error'" @click="onNextPuzzle">{{ $t('puzzle.next') }}</UButton>
      </div>
    </UContainer>
    <PuzzleMap v-if="!showScoreSummary && !showModeSelection" v-bind="mapProps" class="mx-auto my-4" @puzzle-completed="onPuzzleCompleted" />
      <div class="my-2 flex gap-2 justify-center">
        <UButton v-if="!isRushMode" icon="i-lucide-zap" size="md" color="warning" @click="toggleRushMode">{{ $t('rushMode.startButton') }}</UButton>
        <UButton icon="i-lucide-github" size="md" to="https://github.com/verdie-g/dofus-puzzles" target="_blank" color="neutral">GitHub</UButton>
        <UButton icon="i-lucide-hammer" size="md" color="primary" to="builder">{{ $t('puzzle.createPuzzle') }}</UButton>
      </div>
  </div>
</template>
