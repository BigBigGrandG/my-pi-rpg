import type {
  PlayerPosition,
} from '../domain/world-state';
import {
  VILLAGE_BUILDINGS,
  VILLAGE_DECORATIONS,
} from '../domain/village-layout';
import { RUNTIME_DECORATION_ASSETS } from './runtime-assets';
import { SCENE_RENDER_DEPTHS } from './render-depths';

export interface StaticDecorationRenderItem {
  readonly id: string;
  readonly textureKey: string;
  readonly position: PlayerPosition;
  readonly origin: {
    readonly x: number;
    readonly y: number;
  };
  readonly depth: number;
}

export const getVillageRenderItems = (): readonly StaticDecorationRenderItem[] => [
  ...VILLAGE_DECORATIONS.map((decoration) => {
    const asset = RUNTIME_DECORATION_ASSETS.environment[decoration.assetId];
    return {
      id: decoration.id,
      textureKey: asset.id,
      position: decoration.position,
      origin: asset.anchor,
      depth: SCENE_RENDER_DEPTHS.environment,
    };
  }),
  ...VILLAGE_BUILDINGS.map((building) => {
    const asset = RUNTIME_DECORATION_ASSETS.buildings[building.assetId];
    return {
      id: building.id,
      textureKey: asset.id,
      position: building.position,
      origin: asset.anchor,
      depth: SCENE_RENDER_DEPTHS.buildings,
    };
  }),
];
