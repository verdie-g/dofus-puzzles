<script setup lang="ts">
import { MapEntityType } from '@/models/puzzle';
import type { Puzzle, PuzzleResult } from '@/models/puzzle';

const puzzle: Puzzle = {
  name: 'test',
  map: {
    name: 'test',
    cells: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 3, 3, 1, 1, 1, 3, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 3, 3, 1, 1, 1, 3, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  entities: [
    { cellId: 327, type: MapEntityType.Enemy },
    { cellId: 247, type: MapEntityType.Ally },
    { cellId: 289, type: MapEntityType.Obstacle },
  ],
};

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
}
</script>

<template>
  <div>
    <UContainer>
      <p class="text-xl text-center">
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
