import type { Map } from "~/models/map";
import { MapEntityType   } from "~/models/puzzle";
import type {MapEntity, Puzzle} from "~/models/puzzle";

export function encodePuzzle(puzzle: Puzzle) {
    let encoded = '';

    encoded += `m=${puzzle.map.id}`;

    const groupedEntities = groupEntitiesByType(puzzle.entities);
    for (const [typeStr, entities] of Object.entries(groupedEntities)) {
        const type = parseInt(typeStr, 10) as MapEntityType;
        const cellIds = entities.map(e => e.cellId).join('|');
        encoded += `,${entityTypeToShortString(type)}=${cellIds}`;
    }

    // Add a version for backward compatibility.
    return 'v=1,' + encoded;
}

export function decodePuzzle(encoded: string, id: number, maps: Map[]): Puzzle {
    const parts = encoded.split(',');

    if (!parts[0]!.startsWith('v=')) {
        throw new Error('First part should be the version');
    }

    const versionStr = parts[0]!.substring('v='.length);
    const version = parseInt(versionStr, 10);
    if (version !== 1) {
        throw new Error(`Unexpected version ${version}`);
    }

    const puzzle: Partial<Puzzle> = {
        id,
        entities: [],
    };

    parts.shift();
    for (const part of parts) {
        const [key, value] = part.split('=');
        switch (key) {
            case 'm': {
                const mapId = parseInt(value!, 10);
                const map = maps.find(m => m.id === mapId);
                if (map === undefined) {
                    throw new Error(`Map with id ${mapId} not found`);
                }
                puzzle.map = map;
                break;
            }

            case 'a':
            case 'e':
            case 'o': {
                const type = shortStringToEntityType(key);
                value!.split('|').forEach(c => {
                    const cellId = parseInt(c, 10);
                    puzzle.entities!.push({
                        type,
                        cellId,
                    });
                });
            }
        }
    }

    if (puzzle.map === undefined) {
        throw new Error('Puzzle does not have a map');
    }

    return puzzle as Puzzle;
}

function groupEntitiesByType(entities: MapEntity[]) {
    return entities.reduce((acc, entity) => {
        if (!acc[entity.type]) {
            acc[entity.type] = [];
        }
        acc[entity.type].push(entity);
        return acc;
    }, <Record<MapEntityType, MapEntity[]>>{});
}

function entityTypeToShortString(type: MapEntityType) {
    if (type === MapEntityType.Ally) {
        return 'a';
    } else if (type === MapEntityType.Enemy) {
        return 'e';
    } else {
        return 'o';
    }
}

function shortStringToEntityType(typeStr: string) {
    if (typeStr === 'a') {
        return  MapEntityType.Ally;
    }
    
    if (typeStr === 'e') {
        return MapEntityType.Enemy;
    }
    
    if (typeStr === 'o') {
        return MapEntityType.Obstacle;
    }

    throw new Error(`Unexpected entity type '${typeStr}'`);
}