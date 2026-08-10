import { describe, expect, it } from 'vitest';
import { ROAD_MAP } from './road-map';
import {
  BUILDING_IDS,
  ENVIRONMENT_ASSET_IDS,
  VILLAGE_BUILDINGS,
  VILLAGE_DECORATIONS,
  getPlacementBounds,
  isPlacementOnRoad,
} from './village-layout';

describe('village layout', () => {
  it('publishes six stable building identities with future entrance metadata', () => {
    expect(BUILDING_IDS).toEqual([
      'player-house',
      'general-store',
      'clinic',
      'blacksmith',
      'inn',
      'ranch-store',
    ]);
    expect(VILLAGE_BUILDINGS.map((building) => building.id)).toEqual(BUILDING_IDS);

    for (const building of VILLAGE_BUILDINGS) {
      expect(building.futureSceneId).toMatch(/^interior\./);
      expect(building.futureEntranceId).toBe('front-door');
      expect(building.interactive).toBe(false);
      expect(isPlacementOnRoad(building, ROAD_MAP)).toBe(false);
    }
  });

  it('keeps the six buildings on their intended north-of-road sides', () => {
    expect(VILLAGE_BUILDINGS.map(({ id, position }) => [id, position])).toEqual([
      ['player-house', { x: 192, y: 192 }],
      ['general-store', { x: 1760, y: 192 }],
      ['clinic', { x: 1408, y: 480 }],
      ['blacksmith', { x: 1760, y: 480 }],
      ['inn', { x: 192, y: 960 }],
      ['ranch-store', { x: 1760, y: 960 }],
    ]);
  });

  it('places every environment object entirely outside the walkable roads', () => {
    expect(ENVIRONMENT_ASSET_IDS).toEqual([
      'tree-spring',
      'bush-spring',
      'pond-spring',
      'fence-horizontal',
      'fence-vertical',
    ]);
    expect(new Set(VILLAGE_DECORATIONS.map((decoration) => decoration.id)).size).toBe(
      VILLAGE_DECORATIONS.length,
    );

    for (const decoration of VILLAGE_DECORATIONS) {
      const bounds = getPlacementBounds(decoration);
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(ROAD_MAP.worldWidth);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(ROAD_MAP.worldHeight);
      expect(isPlacementOnRoad(decoration, ROAD_MAP)).toBe(false);
      for (const building of VILLAGE_BUILDINGS) {
        expect(rectanglesOverlap(bounds, getPlacementBounds(building))).toBe(false);
      }
    }

    expect(new Set(VILLAGE_DECORATIONS.map((decoration) => decoration.assetId))).toEqual(
      new Set(ENVIRONMENT_ASSET_IDS),
    );
  });

  it('detects a placement that overlaps a road band', () => {
    expect(isPlacementOnRoad({
      id: 'test-road-overlap',
      assetId: 'tree-spring',
      position: { x: 368, y: 240 },
      footprint: { width: 32, height: 32 },
    }, ROAD_MAP)).toBe(true);
  });
});

const rectanglesOverlap = (
  first: ReturnType<typeof getPlacementBounds>,
  second: ReturnType<typeof getPlacementBounds>,
): boolean => (
  first.x < second.x + second.width &&
  first.x + first.width > second.x &&
  first.y < second.y + second.height &&
  first.y + first.height > second.y
);
