<script setup lang="ts">
import { Cell } from '@/models/map';
import {  MapEntityType } from '@/models/puzzle';
import type { Puzzle, PuzzleResult } from '@/models/puzzle';
import { MAP_HORIZONTAL_CELLS_COUNT, MAP_VERTICAL_CELLS_COUNT } from '@/services/map-service';
import { resolveLineOfSight, findShortestPath, findWinningCells} from '@/services/puzzle-service';

interface Props {
  puzzle: Puzzle;
  showLineOfSight: boolean;
  showWinningCells: boolean;
  showMovement: boolean;
  highlightCell: number | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  cellClick: [cellId: number],
  puzzleCompleted: [puzzleResult: PuzzleResult],
}>();

const hoveredCellId: Ref<number | null> = ref(null);
const hoveredCellLineOfSight: Ref<Set<number> | null> = ref(null);
const movementPath: Ref<Set<number> | null> = ref(null);
const gridRef: Ref<HTMLDivElement | null> = ref(null);

const movementPoints = 5;
const rows = MAP_HORIZONTAL_CELLS_COUNT + MAP_VERTICAL_CELLS_COUNT;
const cols = MAP_HORIZONTAL_CELLS_COUNT + MAP_VERTICAL_CELLS_COUNT - 1;

const gridStyle = computed(() => {
  const xRotation = 1.0472; // 60deg
  const zRotation = 0.785398; // 45deg

  let top = 0;
  let left = 0;
  let width = 0;
  let height = 0;
  if (gridRef.value !== null) {
    const originalWidth = gridRef.value.scrollWidth;
    const originalHeight = gridRef.value.scrollHeight;

    const topRightPoint: Point = [originalWidth / 2.0, originalHeight / 2.0];
    const topLeftPoint: Point = [-originalWidth / 2.0, originalHeight / 2.0];

    const rotatedTopRightPoint = pointRotateX(pointRotateZ(topRightPoint, zRotation), xRotation);
    const rotatedTopLeftPoint = pointRotateX(pointRotateZ(topLeftPoint, zRotation), xRotation);

    top = rotatedTopRightPoint[1] - topRightPoint[1];
    left = topLeftPoint[0] - rotatedTopLeftPoint[0];

    const cellRect = gridRef.value.children[0]!.getBoundingClientRect();
    top -= cellRect.height * (MAP_HORIZONTAL_CELLS_COUNT - 1) / 2.0;
    left -= cellRect.width * (MAP_VERTICAL_CELLS_COUNT - 1) / 2.0;

    width = cellRect.width * (MAP_HORIZONTAL_CELLS_COUNT + 0.5);
    height = cellRect.height * (MAP_VERTICAL_CELLS_COUNT + 0.5);
  }

  return {
    wrapper: {
      width: `${width}px`,
      height: `${height}px`,
    },
    grid: {
      transform: `rotateX(${xRotation}rad) rotateZ(-${zRotation}rad)`,
      top: `${top}px`,
      left: `${left}px`,
      'grid-template-rows': `repeat(${rows}, var(--cell-size))`,
      'grid-template-columns': `repeat(${cols}, var(--cell-size))`,
    },
  }
});

const winningCells = computed(() => findWinningCells(movementPoints, props.puzzle));

function resolveCellPosition(cellId: number) {
  const row = Math.round(cellId / (2 * MAP_HORIZONTAL_CELLS_COUNT)) + cellId % MAP_HORIZONTAL_CELLS_COUNT + 1;
  const col = -Math.trunc(cellId / (2 * MAP_HORIZONTAL_CELLS_COUNT)) + cellId % MAP_HORIZONTAL_CELLS_COUNT + MAP_VERTICAL_CELLS_COUNT;
  return [row, col] as const;
}

function getCellClasses(cellId: number) {
  const classes = [];

  const cell = props.puzzle.map.cells[cellId];
  if (cell === Cell.Floor) {
    classes.push('cell-floor');
  
    const [row, col] = resolveCellPosition(cellId); 
    classes.push(((row + col) % 2) === 0 ? 'cell-even' : 'cell-odd');
  
    if (props.showLineOfSight && hoveredCellLineOfSight.value !== null && !hoveredCellLineOfSight.value.has(cellId)) {
      classes.push('cell-fog');
    }
  }
  else if (cell === Cell.Hole) {
    classes.push('cell-hole');
  }
  else if (cell === Cell.Wall) {
    classes.push('cell-wall');
  }
  
  return classes;
}

function resolveCellPositionStyle(cellId: number) {
  const [row, col] = resolveCellPosition(cellId); 
  return { 'grid-area': `${row} / ${col}` }; 
}

function cellHasEntityType(cellId: number, type: MapEntityType) {
  const entity = props.puzzle.entities.find(e => e.cellId === cellId);
  return entity !== undefined && entity.type === type;
}

function getCellIdFromMouseEvent(evt: MouseEvent) {
  const target = evt.target as HTMLCanvasElement;
  return parseInt(target.dataset.cellid!, 10);
}

function onCellOverEnter(evt: MouseEvent) {
  const cellId = getCellIdFromMouseEvent(evt);

  if (props.puzzle.map.cells[cellId] === Cell.Floor) {
    hoveredCellId.value = cellId;
    hoveredCellLineOfSight.value = new Set(resolveLineOfSight(cellId, props.puzzle));
  }

  const ally = props.puzzle.entities.find(e => e.type == MapEntityType.Ally);
  if (ally === undefined) {
    return;
  }

  const path = findShortestPath(ally.cellId, cellId, props.puzzle);
  movementPath.value = path === null || path.length > movementPoints ? null : new Set(path);
}

function onCellOverLeave(_: MouseEvent) {
  hoveredCellId.value = null;
  hoveredCellLineOfSight.value = null;
  movementPath.value = null;
}

function onCellClick(evt: MouseEvent) {
  const targetCellId = getCellIdFromMouseEvent(evt);

  emit('cellClick', targetCellId);

  const ally = props.puzzle.entities.find(e => e.type == MapEntityType.Ally);
  if (ally === undefined) {
    return;
  }

  const path = findShortestPath(ally.cellId, targetCellId, props.puzzle);
  if (path === null || path.length > movementPoints) {
    // Don't make the player lose for a click on an unreachable cells.
    return;
  }

  emit('puzzleCompleted', {
    success: winningCells.value.includes(targetCellId),
    cellId: targetCellId,
  });
}
</script>

<template>
  <div class="grid-wrapper" :style="gridStyle.wrapper">
    <div ref="gridRef" class="grid" :style="gridStyle.grid">
      <div
v-for="(cell, cellId) in props.puzzle.map.cells"
           :key="cellId"
           class="cell"
           :data-cellid="cellId"
           :class="getCellClasses(cellId)"
           :style="resolveCellPositionStyle(cellId)"
           @mouseover="onCellOverEnter"
           @mouseleave="onCellOverLeave"
           @click="onCellClick">
        <template v-if="cell === 3">
            <div class="cell-wall-left"/>
            <div class="cell-wall-top"/>
            <div class="cell-wall-right"/>
        </template>

        <div v-if="cellHasEntityType(cellId, MapEntityType.Ally)" class="cell-ally"/>
        <div v-else-if="cellHasEntityType(cellId, MapEntityType.Obstacle)" class="cell-obstacle"/>
        <div v-else-if="cellHasEntityType(cellId, MapEntityType.Enemy)" class="cell-enemy"/>
        <div v-else-if="props.showMovement && movementPath?.has(cellId)" class="cell-move"/>
        <div v-else-if="(props.highlightCell === cellId || props.showWinningCells) && winningCells.includes(cellId)" class="cell-win"/>
        <div v-else-if="props.highlightCell === cellId && !winningCells.includes(cellId)" class="cell-lose"/>
        <div v-else-if="hoveredCellId === cellId" class="cell-hovered"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-wrapper {
  overflow: hidden;
  position: relative;
  --cell-size: 3rem;
}

.grid {
  position: absolute;
  display: grid;
  gap: 0;
}

.cell-floor {
  cursor: pointer;
}

.cell-floor.cell-odd {
  background-color: #8b8561;
}

.cell-floor.cell-even {
  background-color: #958d69;
}

.cell-floor.cell-fog {
  filter: brightness(0.7);
}

.cell-wall {
  position: relative;
}

.cell-wall-top, .cell-wall-left, .cell-wall-right {
  background-color: #58533a;
  position: absolute;
  outline: 2px solid #a09f9a;
}

.cell-wall-top {
  width: 100%;
  height: 100%;
  bottom: calc(var(--cell-size) / 2.0);
  left: calc(var(--cell-size) / 2.0);
}

.cell-wall-left {
  width: calc(var(--cell-size) / 2.0);
  height: var(--cell-size);
  top: calc(var(--cell-size) / -4.0);
  transform: skew(0deg, -45deg);
}

.cell-wall-right {
  width: var(--cell-size);
  height: calc(var(--cell-size) / 2.0);
  top: calc(var(--cell-size) / 2.0);
  left: calc(var(--cell-size) / 4.0);
  transform: skew(-45deg, 0deg);
}

.cell-hovered,
.cell-ally,
.cell-enemy,
.cell-obstacle,
.cell-move,
.cell-win,
.cell-lose {
  width: 100%;
  height: 100%;
  /* Prevents flickering on hover */
  pointer-events: none;
}

.cell-hovered,
.cell-ally,
.cell-enemy,
.cell-obstacle {
  box-shadow: inset 0px 0px 13px 5px;
}

.cell-hovered {
  color: #FCF5E0;
}

.cell-ally {
  color: #15518F;
}

.cell-enemy {
  color: #eb2b2b;
}

.cell-obstacle {
  color: #60314f;
}

.cell-move {
  background-color: #499814;
}

.cell-win {
  background-color: var(--ui-success);
}

.cell-lose {
  background-color: var(--ui-error);
}
</style>