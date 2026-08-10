import type { PlayerPosition, PlayerState } from '../domain/world-state';
import { PLAYER_SIZE } from '../shared/game-config';
import {
  getPlayerFrameIndex,
  type PlayerAnimationInput,
} from './player-animation';

export const PLAYER_SPRITE_OFFSET_Y = -(PLAYER_SIZE / 4);
export const PLAYER_SHADOW_OFFSET_Y = PLAYER_SIZE / 2 - 1;
export const PLAYER_SHADOW_WIDTH = 22;
export const PLAYER_SHADOW_HEIGHT = 7;

export interface PlayerPresentationState {
  readonly facing: PlayerState['facing'];
  readonly isMoving: boolean;
  readonly animationElapsedMs: number;
}

export interface PlayerRenderPosition {
  readonly x: number;
  readonly y: number;
}

export const createPlayerPresentationState = (
  facing: PlayerState['facing'] = 'down',
): PlayerPresentationState => ({
  facing,
  isMoving: false,
  animationElapsedMs: 0,
});

export const advancePlayerPresentation = (
  previous: PlayerPresentationState,
  player: Pick<PlayerState, 'facing' | 'isMoving'>,
  deltaMs: number,
): PlayerPresentationState => ({
  facing: player.facing,
  isMoving: player.isMoving,
  animationElapsedMs:
    !player.isMoving || player.facing !== previous.facing || !previous.isMoving
      ? 0
      : previous.animationElapsedMs + Math.max(0, deltaMs),
});

export const getPlayerPresentationFrame = (
  presentation: PlayerPresentationState,
): number => {
  const animation: PlayerAnimationInput = {
    facing: presentation.facing,
    isMoving: presentation.isMoving,
    elapsedMs: presentation.animationElapsedMs,
  };
  return getPlayerFrameIndex(animation);
};

export const getPlayerSpritePosition = (
  position: PlayerPosition,
): PlayerRenderPosition => ({
  x: position.x,
  y: position.y + PLAYER_SPRITE_OFFSET_Y,
});

export const getPlayerShadowPosition = (
  position: PlayerPosition,
): PlayerRenderPosition => ({
  x: position.x,
  y: position.y + PLAYER_SHADOW_OFFSET_Y,
});
