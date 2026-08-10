import { describe, expect, it } from 'vitest';
import { SCENE_RENDER_DEPTHS } from './render-depths';

describe('outdoor slice render depth contract', () => {
  it('keeps world layers ordered from terrain to screen-space UI', () => {
    expect([
      SCENE_RENDER_DEPTHS.ground,
      SCENE_RENDER_DEPTHS.roads,
      SCENE_RENDER_DEPTHS.environment,
      SCENE_RENDER_DEPTHS.buildings,
      SCENE_RENDER_DEPTHS.shadows,
      SCENE_RENDER_DEPTHS.characters,
      SCENE_RENDER_DEPTHS.promptBackground,
      SCENE_RENDER_DEPTHS.prompt,
      SCENE_RENDER_DEPTHS.hud,
      SCENE_RENDER_DEPTHS.dialogue,
    ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 10, 20]);
  });
});
