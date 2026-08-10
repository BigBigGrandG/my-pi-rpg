import type { FacingDirection } from '../domain/world-state';
import { RUNTIME_ASSETS } from './runtime-assets';

export const PLAYER_SPRITE_SHEET_WIDTH = RUNTIME_ASSETS.player.width;
export const PLAYER_SPRITE_SHEET_HEIGHT = RUNTIME_ASSETS.player.height;
export const PLAYER_SPRITE_FRAME_WIDTH = RUNTIME_ASSETS.player.frameWidth;
export const PLAYER_SPRITE_FRAME_HEIGHT = RUNTIME_ASSETS.player.frameHeight;
export const PLAYER_SPRITE_FRAME_COUNT = 4;
export const PLAYER_ANIMATION_FRAME_RATE = 10;

export const PLAYER_SPRITE_ROWS: Readonly<Record<FacingDirection, number>> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

export interface PlayerAnimationInput {
  readonly facing: FacingDirection;
  readonly isMoving: boolean;
  readonly elapsedMs: number;
}

export const getPlayerFrameIndex = (
  animation: PlayerAnimationInput,
): number => {
  const row = PLAYER_SPRITE_ROWS[animation.facing];
  if (!animation.isMoving) {
    return row * PLAYER_SPRITE_FRAME_COUNT;
  }

  const elapsedMs = Math.max(0, animation.elapsedMs);
  const frame = Math.floor((elapsedMs * PLAYER_ANIMATION_FRAME_RATE) / 1000)
    % PLAYER_SPRITE_FRAME_COUNT;
  return row * PLAYER_SPRITE_FRAME_COUNT + frame;
};
