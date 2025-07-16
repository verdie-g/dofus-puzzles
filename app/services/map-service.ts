import { Cell } from '@/models/map';
import type { Map, MapPoint } from '@/models/map';

export const MAP_CELLS_COUNT = 560;
export const MAP_HORIZONTAL_CELLS_COUNT = 14;
export const MAP_VERTICAL_CELLS_COUNT = 20;
const INVALID_CELL_ID = -1;

export function mapPointFromCellId(cellId: number) {
    return {
        x: getCellX(cellId),
        y: getCellY(cellId),
        cellId,
    }
}

export function mapPointFromCoordinates(x: number, y: number) {
    const cellId = getCellIdFromCoordinates(x, y);
    return { x, y, cellId };
}

function getCellX(cellId: number) {
    const rowIndex = Math.floor(cellId / MAP_HORIZONTAL_CELLS_COUNT);
    const halfRowOffset = Math.floor((rowIndex + 1) / 2);
    const columnIndex = cellId - rowIndex * MAP_HORIZONTAL_CELLS_COUNT;
    return halfRowOffset + columnIndex;
}

function getCellY(cellId: number) {
    const rowIndex = Math.floor(cellId / MAP_HORIZONTAL_CELLS_COUNT);
    const rowOffset = Math.floor((rowIndex + 1) / 2);
    const adjustedRowIndex = rowIndex - rowOffset;
    const columnIndex = cellId - rowIndex * MAP_HORIZONTAL_CELLS_COUNT;
    return columnIndex - adjustedRowIndex;
}

function getCellIdFromCoordinates(x: number, y: number) {
    if (!areCoordinatesInMap(x, y)) {
        return INVALID_CELL_ID;
    }

    return (x - y) * MAP_HORIZONTAL_CELLS_COUNT + y + Math.trunc((x - y) / 2);
}

function areCoordinatesInMap(x: number, y: number) {
    return x + y >= 0 && x - y >= 0 && x - y < MAP_VERTICAL_CELLS_COUNT * 2 && x + y < MAP_HORIZONTAL_CELLS_COUNT * 2;
}

export function isPointInMap(point: MapPoint) {
    return areCoordinatesInMap(point.x, point.y);
}

export function isValidCellId(cellId: number) {
    return cellId >= 0 && cellId < MAP_CELLS_COUNT;
}

export function pointLos(map: Map, point: MapPoint): boolean {
    return map.cells[point.cellId] !== Cell.Wall;
}

export function pointDistance(p1: MapPoint, p2: MapPoint) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}
