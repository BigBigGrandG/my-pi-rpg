import type { PlayerPosition } from './world-state';
import type { RoadMapDefinition } from './road-map';

export const BUILDING_IDS = [
  'player-house',
  'general-store',
  'clinic',
  'blacksmith',
  'inn',
  'ranch-store',
] as const;

export type BuildingId = (typeof BUILDING_IDS)[number];

export const ENVIRONMENT_ASSET_IDS = [
  'tree-spring',
  'bush-spring',
  'pond-spring',
  'fence-horizontal',
  'fence-vertical',
] as const;

export type EnvironmentAssetId = (typeof ENVIRONMENT_ASSET_IDS)[number];

export interface PlacementFootprint {
  readonly width: number;
  readonly height: number;
}

export interface WorldPlacement {
  readonly id: string;
  readonly assetId: string;
  /** Bottom-center world anchor; the runtime asset uses origin (0.5, 1). */
  readonly position: PlayerPosition;
  readonly footprint: PlacementFootprint;
}

export interface BuildingPlacement extends WorldPlacement {
  readonly id: BuildingId;
  readonly assetId: BuildingId;
  readonly futureSceneId: string;
  readonly futureEntranceId: string;
  readonly interactive: false;
}

export interface EnvironmentPlacement extends WorldPlacement {
  readonly id: string;
  readonly assetId: EnvironmentAssetId;
}

export const VILLAGE_BUILDINGS: readonly BuildingPlacement[] = [
  {
    id: 'player-house',
    assetId: 'player-house',
    position: { x: 192, y: 192 },
    footprint: { width: 192, height: 160 },
    futureSceneId: 'interior.player-house',
    futureEntranceId: 'front-door',
    interactive: false,
  },
  {
    id: 'general-store',
    assetId: 'general-store',
    position: { x: 1760, y: 192 },
    footprint: { width: 192, height: 160 },
    futureSceneId: 'interior.general-store',
    futureEntranceId: 'front-door',
    interactive: false,
  },
  {
    id: 'clinic',
    assetId: 'clinic',
    position: { x: 1408, y: 480 },
    footprint: { width: 192, height: 160 },
    futureSceneId: 'interior.clinic',
    futureEntranceId: 'front-door',
    interactive: false,
  },
  {
    id: 'blacksmith',
    assetId: 'blacksmith',
    position: { x: 1760, y: 480 },
    footprint: { width: 192, height: 160 },
    futureSceneId: 'interior.blacksmith',
    futureEntranceId: 'front-door',
    interactive: false,
  },
  {
    id: 'inn',
    assetId: 'inn',
    position: { x: 192, y: 960 },
    footprint: { width: 192, height: 160 },
    futureSceneId: 'interior.inn',
    futureEntranceId: 'front-door',
    interactive: false,
  },
  {
    id: 'ranch-store',
    assetId: 'ranch-store',
    position: { x: 1760, y: 960 },
    footprint: { width: 192, height: 160 },
    futureSceneId: 'interior.ranch-store',
    futureEntranceId: 'front-door',
    interactive: false,
  },
];

export const VILLAGE_DECORATIONS: readonly EnvironmentPlacement[] = [
  {
    id: 'tree-north-west',
    assetId: 'tree-spring',
    position: { x: 544, y: 176 },
    footprint: { width: 64, height: 96 },
  },
  {
    id: 'tree-north-east',
    assetId: 'tree-spring',
    position: { x: 1312, y: 176 },
    footprint: { width: 64, height: 96 },
  },
  {
    id: 'tree-mid-west',
    assetId: 'tree-spring',
    position: { x: 544, y: 560 },
    footprint: { width: 64, height: 96 },
  },
  {
    id: 'tree-mid-east',
    assetId: 'tree-spring',
    position: { x: 1152, y: 560 },
    footprint: { width: 64, height: 96 },
  },
  {
    id: 'bush-north-west',
    assetId: 'bush-spring',
    position: { x: 64, y: 176 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'bush-north-east',
    assetId: 'bush-spring',
    position: { x: 1440, y: 176 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'bush-mid-west',
    assetId: 'bush-spring',
    position: { x: 128, y: 400 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'bush-mid-east',
    assetId: 'bush-spring',
    position: { x: 1248, y: 400 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'bush-south-west',
    assetId: 'bush-spring',
    position: { x: 544, y: 896 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'bush-south-east',
    assetId: 'bush-spring',
    position: { x: 1312, y: 896 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'pond-main',
    assetId: 'pond-spring',
    position: { x: 768, y: 544 },
    footprint: { width: 192, height: 128 },
  },
  {
    id: 'fence-horizontal-west-1',
    assetId: 'fence-horizontal',
    position: { x: 608, y: 384 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'fence-horizontal-west-2',
    assetId: 'fence-horizontal',
    position: { x: 640, y: 384 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'fence-horizontal-west-3',
    assetId: 'fence-horizontal',
    position: { x: 672, y: 384 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'fence-vertical-east-1',
    assetId: 'fence-vertical',
    position: { x: 1280, y: 384 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'fence-vertical-east-2',
    assetId: 'fence-vertical',
    position: { x: 1280, y: 416 },
    footprint: { width: 32, height: 32 },
  },
  {
    id: 'fence-vertical-east-3',
    assetId: 'fence-vertical',
    position: { x: 1280, y: 448 },
    footprint: { width: 32, height: 32 },
  },
];

export const getPlacementBounds = (placement: WorldPlacement): {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
} => ({
  x: placement.position.x - placement.footprint.width / 2,
  y: placement.position.y - placement.footprint.height,
  width: placement.footprint.width,
  height: placement.footprint.height,
});

export const isPlacementOnRoad = (
  placement: WorldPlacement,
  map: RoadMapDefinition,
): boolean => {
  const bounds = getPlacementBounds(placement);
  const verticalRoadOverlap = map.verticalRoads.some((road) =>
    rangesOverlap(
      bounds.x,
      bounds.x + bounds.width,
      road.start * map.tileSize,
      (road.end + 1) * map.tileSize,
    ),
  );
  const horizontalRoadOverlap = map.horizontalRoads.some((road) =>
    rangesOverlap(
      bounds.y,
      bounds.y + bounds.height,
      road.start * map.tileSize,
      (road.end + 1) * map.tileSize,
    ),
  );

  return verticalRoadOverlap || horizontalRoadOverlap;
};

const rangesOverlap = (
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
): boolean => firstStart < secondEnd && firstEnd > secondStart;
