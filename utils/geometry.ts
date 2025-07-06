export type Point = [x: number, y: number]

export function pointRotateX(point: Point, rotation: number): Point {
    return [
        point[0], // A rotation on X doesn't change x.
        point[1] * Math.cos(rotation),
    ];
}

export function pointRotateZ(point: Point, rotation: number): Point {
    return [
        point[0] * Math.cos(rotation) - point[1] * Math.sin(rotation),
        point[0] * Math.sin(rotation) + point[1] * Math.cos(rotation),
    ];
}
