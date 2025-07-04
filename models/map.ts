export interface Map {
    name: string;
    cells: Cell[];
}

export enum Cell {
    Invisible,
    Floor,
    Hole,
    Wall,
}

export interface MapPoint {
    x: number;
    y: number;
    cellId: number;
}