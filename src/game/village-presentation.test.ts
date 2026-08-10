import { describe, expect, it } from 'vitest';
import {
  VILLAGE_BUILDINGS,
  VILLAGE_DECORATIONS,
} from '../domain/village-layout';
import { getVillageRenderItems } from './village-presentation';
import { SCENE_RENDER_DEPTHS } from './render-depths';

describe('village presentation', () => {
  it('projects every static placement to a bottom-anchored texture item', () => {
    const items = getVillageRenderItems();

    expect(items).toHaveLength(
      VILLAGE_DECORATIONS.length + VILLAGE_BUILDINGS.length,
    );
    expect(items.slice(0, VILLAGE_DECORATIONS.length).every((item) =>
      item.depth === SCENE_RENDER_DEPTHS.environment &&
      item.origin.x === 0.5 &&
      item.origin.y === 1,
    )).toBe(true);
    expect(items.slice(VILLAGE_DECORATIONS.length).every((item) =>
      item.depth === SCENE_RENDER_DEPTHS.buildings &&
      item.origin.x === 0.5 &&
      item.origin.y === 1,
    )).toBe(true);
  });

  it('keeps stable placement IDs and texture identities aligned', () => {
    const items = getVillageRenderItems();

    expect(items.map((item) => item.id)).toEqual([
      ...VILLAGE_DECORATIONS.map((decoration) => decoration.id),
      ...VILLAGE_BUILDINGS.map((building) => building.id),
    ]);
    expect(items.every((item) => item.textureKey.length > 0)).toBe(true);
  });
});
