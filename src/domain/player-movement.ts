import {
  advanceWorld,
  createWorldState,
  PLAYER_SPEED,
  type InputSnapshot,
  type MovementBounds,
  type PlayerPosition,
} from './world-state';

export { PLAYER_SPEED } from './world-state';
export type { MovementBounds, PlayerPosition } from './world-state';

export type MovementInput = InputSnapshot;

export const advancePlayer = (
  position: PlayerPosition,
  input: MovementInput,
  deltaSeconds: number,
  bounds: MovementBounds,
): PlayerPosition =>
  advanceWorld(
    createWorldState(position),
    input,
    deltaSeconds,
    {
      playerSpeed: PLAYER_SPEED,
      movementBounds: bounds,
    },
  ).player.position;
