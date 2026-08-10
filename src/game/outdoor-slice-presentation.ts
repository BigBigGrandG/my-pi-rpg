import type { RoadMapDefinition } from '../domain/road-map';
import {
  getRoadRectangles,
  type RoadRectangle,
} from './road-map-presentation';
import { SCENE_RENDER_DEPTHS } from './render-depths';
import {
  getVillageRenderItems,
  type StaticDecorationRenderItem,
} from './village-presentation';

export interface OutdoorMapRenderPlan {
  readonly ground: RoadRectangle & { readonly depth: number };
  readonly roads: readonly (RoadRectangle & { readonly depth: number })[];
  readonly staticObjects: readonly StaticDecorationRenderItem[];
}

export const getOutdoorMapRenderPlan = (
  map: RoadMapDefinition,
): OutdoorMapRenderPlan => ({
  ground: {
    x: 0,
    y: 0,
    width: map.worldWidth,
    height: map.worldHeight,
    depth: SCENE_RENDER_DEPTHS.ground,
  },
  roads: getRoadRectangles(map).map((road) => ({
    ...road,
    depth: SCENE_RENDER_DEPTHS.roads,
  })),
  staticObjects: getVillageRenderItems(),
});
