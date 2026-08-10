export type FacingDirection = 'up' | 'down' | 'left' | 'right';

export interface PlayerPosition {
  readonly x: number;
  readonly y: number;
}

export interface PlayerState {
  readonly position: PlayerPosition;
  readonly facing: FacingDirection;
  readonly isMoving: boolean;
}

export interface InteractionState {
  readonly targetId: string | null;
}

export interface DialogueState {
  readonly npcId: string | null;
}

export interface WorldState {
  readonly player: PlayerState;
  readonly interaction: InteractionState;
  readonly dialogue: DialogueState;
}

export interface InputSnapshot {
  readonly up: boolean;
  readonly down: boolean;
  readonly left: boolean;
  readonly right: boolean;
}

export interface MovementBounds {
  readonly width: number;
  readonly height: number;
  readonly playerSize: number;
}

export interface WorldRules {
  readonly playerSpeed: number;
  readonly movementBounds: MovementBounds;
}

export const PLAYER_SPEED = 200;

export const createWorldState = (position: PlayerPosition): WorldState => ({
  player: {
    position,
    facing: 'down',
    isMoving: false,
  },
  interaction: {
    targetId: null,
  },
  dialogue: {
    npcId: null,
  },
});

export const advanceWorld = (
  state: WorldState,
  input: InputSnapshot,
  deltaSeconds: number,
  rules: WorldRules,
): WorldState => {
  const horizontalDirection = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const verticalDirection = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const directionLength = Math.hypot(horizontalDirection, verticalDirection);
  const facing = resolveFacing(
    horizontalDirection,
    verticalDirection,
    state.player.facing,
  );

  const nextPosition =
    directionLength === 0 || deltaSeconds <= 0
      ? clampPosition(state.player.position, rules.movementBounds)
      : clampPosition(
          {
            x:
              state.player.position.x +
              (horizontalDirection / directionLength) *
                rules.playerSpeed *
                deltaSeconds,
            y:
              state.player.position.y +
              (verticalDirection / directionLength) *
                rules.playerSpeed *
                deltaSeconds,
          },
          rules.movementBounds,
        );

  return {
    ...state,
    player: {
      ...state.player,
      position: nextPosition,
      facing,
      isMoving: hasPositionChanged(state.player.position, nextPosition),
    },
  };
};

const resolveFacing = (
  horizontalDirection: number,
  verticalDirection: number,
  currentFacing: FacingDirection,
): FacingDirection => {
  if (verticalDirection !== 0) {
    return verticalDirection > 0 ? 'down' : 'up';
  }

  if (horizontalDirection !== 0) {
    return horizontalDirection > 0 ? 'right' : 'left';
  }

  return currentFacing;
};

const hasPositionChanged = (
  previous: PlayerPosition,
  next: PlayerPosition,
): boolean => previous.x !== next.x || previous.y !== next.y;

const clampPosition = (
  position: PlayerPosition,
  bounds: MovementBounds,
): PlayerPosition => {
  const halfPlayerSize = bounds.playerSize / 2;

  return {
    x: clamp(position.x, halfPlayerSize, bounds.width - halfPlayerSize),
    y: clamp(position.y, halfPlayerSize, bounds.height - halfPlayerSize),
  };
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum);
