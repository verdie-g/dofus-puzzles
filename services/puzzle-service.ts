import { MapEntityType  } from '@/models/puzzle';
import type {Puzzle} from '@/models/puzzle';
import { MAP_CELLS_COUNT, MAP_HORIZONTAL_CELLS_COUNT, isPointInMap, isValidCellId, mapPointFromCellId, mapPointFromCoordinates, pointDistance, pointLos } from './map-service';
import { Cell } from '~/models/map';
import type { MapPoint } from '~/models/map';

export function resolveLineOfSight(refCellId: number, puzzle: Puzzle) : number[] {
    const refPos = mapPointFromCellId(refCellId);

    const allCellIds = Array.from(Array(MAP_CELLS_COUNT).keys())
    const orderedCells = allCellIds.map(cellId => {
        const point = mapPointFromCellId(cellId);
        return { point, distance: pointDistance(refPos, point) };
    });

    orderedCells.sort((a, b) => b.distance - a.distance);

    const result: number[] = [];
    const tested: Map<number, boolean> = new Map();

    for (const { point } of orderedCells) {
        if (
            tested.has(point.cellId) &&
            refPos.x + refPos.y !== point.x + point.y &&
            refPos.x - refPos.y !== point.x - point.y
        ) {
            continue;
        }

        const line = getPointsBetween(refPos.cellId, point.cellId);
        if (line.length === 0) {
            result.push(point.cellId);
            continue;
        }

        let los = true;
        for (let i = 0; i < line.length; i++) {
            const currentPoint = line[i]!;
            if (!isPointInMap(currentPoint)) {
                continue;
            }

            if (
                i > 0 &&
                puzzle.entities.find(e => e.cellId === line[i - 1]!.cellId) !== undefined
            ) {
                los = false;
            } else if (
                currentPoint.x + currentPoint.y === refPos.x + refPos.y ||
                currentPoint.x - currentPoint.y === refPos.x - refPos.y
            ) {
                los = los && pointLos(puzzle.map, currentPoint);
            } else if (!tested.has(currentPoint.cellId)) {
                los = los && pointLos(puzzle.map, currentPoint);
            } else {
                los = los && tested.get(currentPoint.cellId)!;
            }
        }

        tested.set(point.cellId, los);
    }

    for (const cellId of allCellIds) {
        const p = mapPointFromCellId(cellId);
        if (tested.get(p.cellId)) {
            result.push(p.cellId);
        }
    }

    return result;
}

export function isCellAccessible(cellId: number, puzzle: Puzzle) {
    return puzzle.map.cells[cellId] === Cell.Floor
        && puzzle.entities.find(e => e.cellId === cellId) === undefined;
}

export function findWinningCells(maxMovementPoints: number, puzzle: Puzzle) {
    const allyCellId = puzzle.entities.find(e => e.type == MapEntityType.Ally)!.cellId;
    const enemyCellId = puzzle.entities.find(e => e.type == MapEntityType.Enemy)!.cellId;
    const enemyLineOfSight = resolveLineOfSight(enemyCellId, puzzle);

    const winningCells = [];
    let winningCellsDistance = -1;
    for (const cellId of enemyLineOfSight) {
        const path = findShortestPath(allyCellId, cellId, puzzle);
        if (path === null) {
            continue;
        }

        if (path.length > maxMovementPoints) {
            continue;
        }

        if (winningCellsDistance === -1 || path.length < winningCellsDistance) {
            winningCells.length = 0;
            winningCells.push(cellId);
            winningCellsDistance = path.length;
        }
        else if (path.length === winningCellsDistance) {
            winningCells.push(cellId);
        }
    }

    return winningCells;
}

export function findShortestPath(fromCellId: number, toCellId: number, puzzle: Puzzle): number[] | null {
    const fromPoint = mapPointFromCellId(fromCellId);
    const toPoint = mapPointFromCellId(toCellId);

    const path = findShortestPathRec(fromPoint, toPoint, puzzle);
    if (path === null) {
        return null;
    }
    
    path.shift(); // Remove starting cell.
    return path.map(c => c.cellId);
}

function findShortestPathRec(fromPoint: MapPoint, toPoint: MapPoint, puzzle: Puzzle): MapPoint[] | null {
    const toVisit: MapPoint[][] = [[fromPoint]];
    const visited = new Set<number>([fromPoint.cellId]);

    while (toVisit.length > 0) {
        const path = toVisit.shift()!;
        const current = path[path.length - 1]!;

        if (current.cellId === toPoint.cellId) {
            return path;
        }

        const neighbors = [
            mapPointFromCoordinates(current.x, current.y - 1),
            mapPointFromCoordinates(current.x + 1, current.y),
            mapPointFromCoordinates(current.x, current.y + 1),
            mapPointFromCoordinates(current.x - 1, current.y),
        ];

        for (const neighbor of neighbors) {
            if (visited.has(neighbor.cellId)
             || !isPointInMap(neighbor)
             || !isCellAccessible(neighbor.cellId, puzzle)) {
                continue;
            }

            visited.add(neighbor.cellId);
            toVisit.push([...path, neighbor]);
        }
    }

    return null;
}


// Bresenham's line algorithm.
function getPointsBetween(startCellId: number, endCellId: number): MapPoint[] {
    if (startCellId === endCellId) {
        return [];
    }

    if (!isValidCellId(startCellId) || !isValidCellId(endCellId)) {
        return [];
    }

    const startRow = Math.floor(startCellId / MAP_HORIZONTAL_CELLS_COUNT);
    const startRowOffset = Math.floor((startRow + 1) / 2);
    const x0 = startRowOffset + (startCellId - startRow * MAP_HORIZONTAL_CELLS_COUNT);

    const startColumn = Math.floor(startCellId / MAP_HORIZONTAL_CELLS_COUNT);
    const startColumnOffset = Math.floor((startColumn + 1) / 2);
    const y0 = (startCellId - startColumn * MAP_HORIZONTAL_CELLS_COUNT) - (startColumn - startColumnOffset);

    const endRow = Math.floor(endCellId / MAP_HORIZONTAL_CELLS_COUNT);
    const endRowOffset = Math.floor((endRow + 1) / 2);
    const x1 = endRowOffset + (endCellId - endRow * MAP_HORIZONTAL_CELLS_COUNT);

    const endColumn = Math.floor(endCellId / MAP_HORIZONTAL_CELLS_COUNT);
    const endColumnOffset = Math.floor((endColumn + 1) / 2);
    const y1 = (endCellId - endColumn * MAP_HORIZONTAL_CELLS_COUNT) - (endColumn - endColumnOffset);

    const dx = x1 - x0;
    const dy = y1 - y0;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const stepX = dx / distance;
    const stepY = dy / distance;
    const stepXAbs = Math.abs(1 / stepX);
    const stepYAbs = Math.abs(1 / stepY);
    const stepXSign = stepX < 0 ? -1 : 1;
    const stepYSign = stepY < 0 ? -1 : 1;
    let tMaxX = 0.5 * stepXAbs;
    let tMaxY = 0.5 * stepYAbs;

    const pointsBetween: MapPoint[] = [];
    let currentX = x0;
    let currentY = y0;

    while (currentX !== x1 || currentY !== y1) {
        if (Math.abs(tMaxX - tMaxY) < 0.0001) {
            tMaxX += stepXAbs;
            tMaxY += stepYAbs;
            currentX += stepXSign;
            currentY += stepYSign;
        } else if (tMaxX < tMaxY) {
            tMaxX += stepXAbs;
            currentX += stepXSign;
        } else {
            tMaxY += stepYAbs;
            currentY += stepYSign;
        }

        pointsBetween.push(mapPointFromCoordinates(currentX, currentY));
    }

    return pointsBetween;
}