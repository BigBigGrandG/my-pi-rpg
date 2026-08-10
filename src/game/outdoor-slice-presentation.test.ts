import { describe, expect, it } from 'vitest';
import {
  BUILDING_IDS,
  ENVIRONMENT_ASSET_IDS,
  VILLAGE_BUILDINGS,
  VILLAGE_DECORATIONS,
} from '../domain/village-layout';
import { ROAD_MAP } from '../domain/road-map';
import { RUNTIME_DECORATION_ASSETS } from './runtime-assets';
import { SCENE_RENDER_DEPTHS } from './render-depths';
import { getOutdoorMapRenderPlan } from './outdoor-slice-presentation';

describe('outdoor slice map presentation', () => {
  it('composes the complete typed map into ordered render layers', () => {
    const plan = getOutdoorMapRenderPlan(ROAD_MAP);

    expect(plan.ground).toEqual({
      x: 0,
      y: 0,
      width: 1920,
      height: 1280,
      depth: SCENE_RENDER_DEPTHS.ground,
    });
    expect(plan.roads).toHaveLength(6);
    expect(plan.roads.every((road) => (
      road.depth === SCENE_RENDER_DEPTHS.roads &&
      road.x >= 0 &&
      road.y >= 0 &&
      road.x + road.width <= ROAD_MAP.worldWidth &&
      road.y + road.height <= ROAD_MAP.worldHeight
    ))).toBe(true);

    expect(plan.staticObjects).toHaveLength(
      VILLAGE_DECORATIONS.length + VILLAGE_BUILDINGS.length,
    );
    expect(plan.staticObjects.map((item) => item.id)).toEqual([
      ...VILLAGE_DECORATIONS.map((decoration) => decoration.id),
      ...VILLAGE_BUILDINGS.map((building) => building.id),
    ]);
    expect(new Set(plan.staticObjects.map((item) => item.textureKey))).toEqual(
      new Set([
        ...ENVIRONMENT_ASSET_IDS.map((assetId) =>
          RUNTIME_DECORATION_ASSETS.environment[assetId].id,
        ),
        ...BUILDING_IDS.map((assetId) =>
          RUNTIME_DECORATION_ASSETS.buildings[assetId].id,
        ),
      ]),
    );
  });
});
