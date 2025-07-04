import type { Map } from '@/models/map';

export interface Puzzle {
    name: string;
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