import type { Map } from '@/models/map';

export interface Puzzle {
    id: number;
    map: Map;
    entities: MapEntity[];
}

export interface MapEntity {
    cellId: number;
    type: MapEntityType;
}

export enum MapEntityType {
    Ally,
    Enemy,
    Obstacle,
}

export interface PuzzleResult {
    success: boolean;
    cellId: number;
}