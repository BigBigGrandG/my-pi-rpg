import {
  PLAYER_SPEED,
  type FootCollider,
  type MovementBounds,
  type PlayerPosition,
  type WorldRules,
} from './world-state';

export const TILE_SIZE = 32;
export const MAP_COLUMNS = 60;
export const MAP_ROWS = 40;
export const WORLD_WIDTH = TILE_SIZE * MAP_COLUMNS;
export const WORLD_HEIGHT = TILE_SIZE * MAP_ROWS;

export interface TileRange {
  readonly start: number;
  readonly end: number;
}

export interface RoadMapDefinition {
  readonly tileSize: number;
  readonly columns: number;
  readonly rows: number;
  readonly worldWidth: number;
  readonly worldHeight: number;
  readonly verticalRoads: readonly TileRange[];
  readonly horizontalRoads: readonly TileRange[];
  readonly playerSpawn: PlayerPosition;
}

export const ROAD_MAP: RoadMapDefinition = {
  tileSize: TILE_SIZE,
  columns: MAP_COLUMNS,
  rows: MAP_ROWS,
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  verticalRoads: [
    { start: 10, end: 12 },
    { start: 29, end: 31 },
    { start: 48, end: 50 },
  ],
  horizontalRoads: [
    { start: 7, end: 9 },
    { start: 19, end: 21 },
    { start: 31, end: 33 },
  ],
  playerSpawn: {
    x: 11 * TILE_SIZE + TILE_SIZE / 2,
    y: 32 * TILE_SIZE + TILE_SIZE / 2,
  },
};

export const ROAD_PLAYER_COLLIDER: FootCollider = {
  width: 16,
  height: 8,
  offsetX: 0,
  offsetY: 12,
};

export const ROAD_MOVEMENT_BOUNDS: MovementBounds = {
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
  playerSize: 32,
};

export const isRoadWalkable = (
  position: PlayerPosition,
  collider: FootCollider,
  map: RoadMapDefinition = ROAD_MAP,
): boolean => {
  const left = position.x + collider.offsetX - collider.width / 2;
  const right = position.x + collider.offsetX + collider.width / 2;
  const top = position.y + collider.offsetY - collider.height / 2;
  const bottom = position.y + collider.offsetY + collider.height / 2;

  if (
    left < 0 ||
    right > map.worldWidth ||
    top < 0 ||
    bottom > map.worldHeight
  ) {
    return false;
  }

  const inVerticalRoad = map.verticalRoads.some((road) =>
    isContainedInTileRange(left, right, road, map.tileSize),
  );
  const inHorizontalRoad = map.horizontalRoads.some((road) =>
    isContainedInTileRange(top, bottom, road, map.tileSize),
  );

  return inVerticalRoad || inHorizontalRoad;
};

export const ROAD_WORLD_RULES: WorldRules = {
  playerSpeed: PLAYER_SPEED,
  movementBounds: ROAD_MOVEMENT_BOUNDS,
  collision: {
    collider: ROAD_PLAYER_COLLIDER,
    maxStep: TILE_SIZE / 2,
    canOccupy: (position, collider) => isRoadWalkable(position, collider),
  },
};

const isContainedInTileRange = (
  minimum: number,
  maximum: number,
  range: TileRange,
  tileSize: number,
): boolean =>
  minimum >= range.start * tileSize &&
  maximum <= (range.end + 1) * tileSize;
