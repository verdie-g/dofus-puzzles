import encodedPuzzles from '~/data/puzzles.json';
import { decodePuzzle } from './puzzle-encoder';
import { getMaps } from './map-repository';

export function getPuzzles() {
    const maps = getMaps();
    const puzzles = [];
    for (let id = 0; id < encodedPuzzles.length; id += 1) {
        // The line number is used as id. To avoid breaking the sequence
        // when removing a puzzle, it is instead set to empty.
        const encodedPuzzle = encodedPuzzles[id]!;
        if (encodedPuzzle === '') {
            continue;
        }

        puzzles.push(decodePuzzle(encodedPuzzle, id, maps));
    }

    return puzzles;
}