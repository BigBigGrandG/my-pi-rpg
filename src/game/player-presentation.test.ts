import { describe, expect, it } from 'vitest';
import {
  advancePlayerPresentation,
  createPlayerPresentationState,
  getPlayerPresentationFrame,
  getPlayerShadowPosition,
  getPlayerSpritePosition,
} from './player-presentation';

describe('player presentation', () => {
  it('advances animation only while the domain reports actual movement', () => {
    const initial = createPlayerPresentationState();
    const moving = advancePlayerPresentation(
      initial,
      { facing: 'down', isMoving: true },
      100,
    );
    const continuing = advancePlayerPresentation(
      moving,
      { facing: 'down', isMoving: true },
      100,
    );
    const blocked = advancePlayerPresentation(
      continuing,
      { facing: 'down', isMoving: false },
      100,
    );

    expect(moving.animationElapsedMs).toBe(0);
    expect(continuing.animationElapsedMs).toBe(100);
    expect(getPlayerPresentationFrame(continuing)).toBe(1);
    expect(blocked.animationElapsedMs).toBe(0);
    expect(getPlayerPresentationFrame(blocked)).toBe(0);
  });

  it('starts a newly facing direction at its first movement frame', () => {
    const movingRight = advancePlayerPresentation(
      {
        facing: 'down',
        isMoving: true,
        animationElapsedMs: 300,
      },
      { facing: 'right', isMoving: true },
      100,
    );

    expect(movingRight.animationElapsedMs).toBe(0);
    expect(getPlayerPresentationFrame(movingRight)).toBe(8);
  });

  it('places the sprite above the collision center and the shadow below it', () => {
    expect(getPlayerSpritePosition({ x: 368, y: 1040 })).toEqual({
      x: 368,
      y: 1032,
    });
    expect(getPlayerShadowPosition({ x: 368, y: 1040 })).toEqual({
      x: 368,
      y: 1055,
    });
  });
});
