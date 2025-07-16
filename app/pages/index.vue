<script setup lang="ts">
import type { Puzzle, PuzzleResult } from '@/models/puzzle';
import { getPuzzles } from '~/services/puzzle-repository';

const puzzles = getPuzzles();
arrayShuffle(puzzles);

const puzzle: Ref<Puzzle> = ref(puzzles[0]!);
const puzzleResult: Ref<PuzzleResult | null> = ref(null);
const playing: Ref<boolean> = ref(true);

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

  unami.track('puzzle-completed', {
    puzzleId: puzzle.value.id,
    success: r.success,
  });

  playing.value = false;
  puzzleResult.value = r;
  mapProps.value.showLineOfSight = true;
  mapProps.value.showWinningCells = true;
  mapProps.value.showMovement = false;
  mapProps.value.highlightCell = r.cellId;
}

function onNextPuzzle() {
  if (playing.value) {
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
</script>

<template>
  <div>
    <UContainer>
      <p class="mt-2 text-xl text-center">
        Déplacez-<span class="text-[#15518F]">vous</span> sur la position la plus proche pour avoir l'<span class="text-[#eb2b2b]">ennemi</span>
        en ligne de mire sans être gêné par les <span class="text-[#60314f]">obstacles</span>.
      </p>
      <div class="my-2 flex justify-center" :class="{ invisible: playing }">
        <UButton trailing-icon="i-lucide-arrow-right" size="md" :color="puzzleResult?.success ? 'success' : 'error'" @click="onNextPuzzle">Suivant</UButton>
      </div>
    </UContainer>
    <PuzzleMap v-bind="mapProps" class="mx-auto my-4" @puzzle-completed="onPuzzleCompleted" />
    <div class="my-2 flex gap-2 justify-center">
        <UButton icon="i-lucide-github" size="md" to="https://github.com/verdie-g/dofus-puzzles" target="_blank" color="neutral">GitHub</UButton>
        <UButton icon="i-lucide-hammer" size="md" color="primary" to="builder">Créer un puzzle</UButton>
      </div>
  </div>
</template>
