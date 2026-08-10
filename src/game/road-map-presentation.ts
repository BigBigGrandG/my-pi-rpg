import type { RoadMapDefinition } from '../domain/road-map';

export interface RoadRectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const ROAD_CAMERA_SETTINGS = {
  zoom: 1,
  lerpX: 0.08,
  lerpY: 0.08,
} as const;

export const getRoadRectangles = (
  map: RoadMapDefinition,
): readonly RoadRectangle[] => [
  ...map.verticalRoads.map((road) => ({
    x: road.start * map.tileSize,
    y: 0,
    width: (road.end - road.start + 1) * map.tileSize,
    height: map.worldHeight,
  })),
  ...map.horizontalRoads.map((road) => ({
    x: 0,
    y: road.start * map.tileSize,
    width: map.worldWidth,
    height: (road.end - road.start + 1) * map.tileSize,
  })),
];
