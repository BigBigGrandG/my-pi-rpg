import { describe, expect, it } from 'vitest';
import {
  getPlayerFrameIndex,
  PLAYER_ANIMATION_FRAME_RATE,
  PLAYER_SPRITE_FRAME_HEIGHT,
  PLAYER_SPRITE_FRAME_WIDTH,
  PLAYER_SPRITE_ROWS,
  PLAYER_SPRITE_SHEET_HEIGHT,
  PLAYER_SPRITE_SHEET_WIDTH,
} from './player-animation';

describe('player animation contract', () => {
  it('uses a 4-by-4 sheet with the agreed directional rows', () => {
    expect({
      sheet: [PLAYER_SPRITE_SHEET_WIDTH, PLAYER_SPRITE_SHEET_HEIGHT],
      frame: [PLAYER_SPRITE_FRAME_WIDTH, PLAYER_SPRITE_FRAME_HEIGHT],
      rows: PLAYER_SPRITE_ROWS,
    }).toEqual({
      sheet: [128, 192],
      frame: [32, 48],
      rows: { down: 0, left: 1, right: 2, up: 3 },
    });
  });

  it('loops four movement frames at approximately ten frames per second', () => {
    expect(PLAYER_ANIMATION_FRAME_RATE).toBe(10);
    expect(getPlayerFrameIndex({ facing: 'down', isMoving: true, elapsedMs: 0 })).toBe(0);
    expect(getPlayerFrameIndex({ facing: 'down', isMoving: true, elapsedMs: 99 })).toBe(0);
    expect(getPlayerFrameIndex({ facing: 'down', isMoving: true, elapsedMs: 100 })).toBe(1);
    expect(getPlayerFrameIndex({ facing: 'down', isMoving: true, elapsedMs: 399 })).toBe(3);
    expect(getPlayerFrameIndex({ facing: 'down', isMoving: true, elapsedMs: 400 })).toBe(0);
  });

  it('starts every facing at its first frame while idle or blocked', () => {
    expect(getPlayerFrameIndex({ facing: 'down', isMoving: false, elapsedMs: 900 })).toBe(0);
    expect(getPlayerFrameIndex({ facing: 'left', isMoving: false, elapsedMs: 900 })).toBe(4);
    expect(getPlayerFrameIndex({ facing: 'right', isMoving: false, elapsedMs: 900 })).toBe(8);
    expect(getPlayerFrameIndex({ facing: 'up', isMoving: false, elapsedMs: 900 })).toBe(12);
  });
});
