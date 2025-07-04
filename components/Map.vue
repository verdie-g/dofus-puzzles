<script setup lang="ts">
import { Cell } from '@/models/map';
import { type Puzzle, MapEntityType } from '@/models/puzzle';
import { MAP_HORIZONTAL_CELLS_COUNT, MAP_VERTICAL_CELLS_COUNT } from '@/services/map-service';
import { resolveLineOfSight, findShortestPath, findWinningCells} from '@/services/puzzle-service';

interface Props {
  puzzle: Puzzle;
  lineOfSight: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  puzzleCompleted: [puzzleResult: string]
}>()

let hoveredCellId: Ref<number | null> = ref(null);
let hoveredCellLineOfSight: Ref<Set<number> | null> = ref(null);
let movementPath: Ref<Set<number> | null> = ref(null);

const movementPoints = 5;
const rows = MAP_HORIZONTAL_CELLS_COUNT + MAP_VERTICAL_CELLS_COUNT;
const cols = MAP_HORIZONTAL_CELLS_COUNT + MAP_VERTICAL_CELLS_COUNT - 1;
const gridStyle = {
  'grid-template-rows': `repeat(${rows}, 80px)`,
  'grid-template-columns': `repeat(${cols}, 80px)`,
};

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
  
    if (props.lineOfSight && hoveredCellLineOfSight.value !== null && !hoveredCellLineOfSight.value.has(cellId)) {
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
  return props.puzzle.entities.find(e => e.cellId === cellId && e.type === type);
}

function getCellIdFromMouseEvent(evt: MouseEvent) {
  const target = (<HTMLCanvasElement>evt.target);
  return parseInt(target.dataset.cellid!, 10);
}

function onCellOverEnter(evt: MouseEvent) {
  const cellId = getCellIdFromMouseEvent(evt);
  hoveredCellId.value = cellId;
  hoveredCellLineOfSight.value = new Set(resolveLineOfSight(cellId, props.puzzle));

  const allyCellId = props.puzzle.entities.filter(e => e.type == MapEntityType.Ally)[0].cellId;
  const path = findShortestPath(allyCellId, cellId, props.puzzle);
  movementPath.value = path === null || path.length > movementPoints ? null : new Set(path);
}

function onCellOverLeave(_: MouseEvent) {
  hoveredCellId.value = null;
  hoveredCellLineOfSight.value = null;
  movementPath.value = null;
}

function onCellClick(evt: MouseEvent) {
  const targetCellId = getCellIdFromMouseEvent(evt);

  const allyCellId = props.puzzle.entities.filter(e => e.type == MapEntityType.Ally)[0].cellId;
  const path = findShortestPath(allyCellId, targetCellId, props.puzzle);
  if (path === null || path.length > movementPoints) {
    // Don't make the player lose for a click on an unreachable cells.
    return;
  }

  const winningCells = findWinningCells(movementPoints, props.puzzle);

  let puzzleResult;
  if (winningCells.includes(targetCellId)) {
    puzzleResult = 'WON';
  } else {
    puzzleResult = 'LOST';
  }

  emit('puzzleCompleted', puzzleResult);
}
</script>

<template>
  <div class="grid-wrapper">
    <div class="grid" :style="gridStyle">
      <div v-for="(cell, cellId) in props.puzzle.map.cells"
           class="cell"
           :data-cellid="cellId"
           :class="getCellClasses(cellId)"
           :style="resolveCellPositionStyle(cellId)"
           @mouseover="onCellOverEnter"
           @mouseleave="onCellOverLeave"
           @click="onCellClick">
        <template v-if="cell === 3">
            <div class="cell-wall-left"></div>
            <div class="cell-wall-top"></div>
            <div class="cell-wall-right"></div>
        </template>

        <div v-if="cellHasEntityType(cellId, MapEntityType.Ally)" class="cell-ally"></div>
        <div v-else-if="cellHasEntityType(cellId, MapEntityType.Obstacle)" class="cell-obstacle"></div>
        <div v-else-if="cellHasEntityType(cellId, MapEntityType.Enemy)" class="cell-enemy"></div>
        <div v-else-if="movementPath?.has(cellId)" class="cell-move"></div>
        <div v-else-if="hoveredCellId === cellId" class="cell-hovered"></div>
      </div>
    </div>
  </div>
</template>

<style>
.grid-wrapper {
  overflow: hidden;
}

.grid {
  display: grid;
  gap: 0;
  transform: rotateX(60deg) rotateZ(-45deg);
  /* These margins could probably be computed somehow */
  margin-top: -864px;
  margin-left: -567px;
  margin-bottom: -519px;
}

.cell-floor {
  border: 1px solid #726c50;
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
  bottom: 40px;
  left: 40px;
}

.cell-wall-left {
  width: 40px;
  height: 80px;
  top: -20px;
  transform: skew(0deg, -45deg);
}

.cell-wall-right {
  width: 80px;
  height: 40px;
  top: 40px;
  left: 20px;
  transform: skew(-45deg, 0deg);
}

.cell-hovered,
.cell-ally,
.cell-enemy,
.cell-obstacle,
.cell-move {
  width: 100%;
  height: 100%;
  /* Prevents flickering on hover */
  pointer-events: none;
}

.cell-hovered,
.cell-ally,
.cell-enemy,
.cell-obstacle {
  background-color: transparent;
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
</style>