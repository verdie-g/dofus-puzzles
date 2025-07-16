<script setup lang="ts">
import { MapEntityType  } from '~/models/puzzle';
import type { Puzzle } from '~/models/puzzle';
import { getMaps } from '~/services/map-repository';
import { encodePuzzle } from '~/services/puzzle-encoder';

useSeoMeta({
  title: 'Dofus Puzzles : Créer votre Puzzle',
  description: 'Créez votre propre puzzle Dofus et ajoutez-le sur GitHub pour qu’il soit jouable par tous',
})

const toast = useToast();

const maps = getMaps();

const puzzle: Ref<Puzzle> = ref({
  id: -1,
  map: maps[0]!,
  entities: [],
});
const placingEntityType: Ref<MapEntityType | null> = ref(null);
const puzzleCode = computed(() => encodePuzzle(puzzle.value));

function placeEntity(entityType: MapEntityType) {
    placingEntityType.value = entityType;
}

function clear() {
    puzzle.value.entities = [];
}

async function copyPuzzleCodeToClipboard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await navigator.permissions.query({ name: 'clipboard-write' as any });
    if (result.state === "granted" || result.state === "prompt") {
         await navigator.clipboard.writeText(puzzleCode.value);
         toast.add({
            title: 'Le puzzle encodé a été copié dans le presse-papiers !',
            color: 'success',
            icon: 'i-lucide-clipboard-copy',
            duration: 4000,
         });
    } else {
        toast.add({
            title: 'Impossile de copier le puzzle encodé dans le presse-papiers !',
            color: 'error',
            icon: 'i-lucide-clipboard-copy',
            duration: 4000,
         });
    }

    umami.track('puzzle-built-copied');
}

function onCellClick(cellId: number) {
    if (placingEntityType.value === null) {
        return;
    }

    const { entities } = puzzle.value;
    const cellEntityIdx = entities.findIndex(e => e.cellId === cellId);
    if (cellEntityIdx !== -1) {
        if (entities[cellEntityIdx]!.type === placingEntityType.value) {
            entities.splice(cellEntityIdx, 1);
        } else {
            entities[cellEntityIdx]!.type = placingEntityType.value;
        }
    } else {
        entities.push({ cellId, type: placingEntityType.value });
    }

    // Make sure there is only one Ally/Enemy.
    if (placingEntityType.value !== MapEntityType.Obstacle) {
        puzzle.value.entities = puzzle.value.entities.filter(e => e.type !== placingEntityType.value || e.cellId === cellId);
    }
}

function mapEntityTypeToString(type: MapEntityType | null) {
    switch (type) {
        case MapEntityType.Ally:
            return 'allié';
        case MapEntityType.Enemy:
            return 'enemi';
        case MapEntityType.Obstacle:
            return 'obstacle';
        default:
            return '';
    }
}
</script>

<template>
    <div>
        <UContainer class="mt-3">
            <div class="flex gap-2 justify-center">
                <UButton size="md" color="neutral" @click="placeEntity(0)">Placer Allié</UButton>
                <UButton size="md" color="neutral" @click="placeEntity(1)">Placer Ennemi</UButton>
                <UButton size="md" color="neutral" @click="placeEntity(2)">Placer Obstacle</UButton>
                <UButton size="md" color="neutral" @click="clear">Tout Effacer</UButton>
                <USelectMenu v-model="puzzle.map" size="md" :items="maps" label-key="name" @change="clear" />
            </div>
            <div class="my-4 flex justify-center">
                <UButtonGroup>
                    <UInput v-model="puzzleCode" color="neutral" variant="outline" readonly class="w-md" />
                    <UButton color="neutral" variant="subtle" icon="i-lucide-clipboard" @click="copyPuzzleCodeToClipboard" />
                    <UButton icon="i-lucide-github" size="md" to="https://github.com/verdie-g/dofus-puzzles/blob/main/app/data/puzzles.json" target="_blank" color="neutral">PR</UButton>
                </UButtonGroup>
            </div>
            <p class="flex justify-center" :class="{ invisible: placingEntityType === null }">
                Cliquez sur une cellule pour placer l'{{ mapEntityTypeToString(placingEntityType) }}
            </p>
        </UContainer>
        <PuzzleMap :puzzle="puzzle" :show-line-of-sight="true" :show-winning-cells="true" :show-movement="false" :highlight-cell="null" class="mx-auto my-4" @cell-click="onCellClick" />
    </div>
</template>