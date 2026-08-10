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
  readonly lastPressedDirection?: FacingDirection;
}

export interface MovementBounds {
  readonly width: number;
  readonly height: number;
  readonly playerSize: number;
}

export interface FootCollider {
  readonly width: number;
  readonly height: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

export interface CollisionRules {
  readonly collider: FootCollider;
  readonly maxStep: number;
  readonly canOccupy: (position: PlayerPosition, collider: FootCollider) => boolean;
}

export interface WorldRules {
  readonly playerSpeed: number;
  readonly movementBounds: MovementBounds;
  readonly collision?: CollisionRules;
}

export const PLAYER_SPEED = 160;

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
    input,
  );

  const nextPosition =
    directionLength === 0 || deltaSeconds <= 0
      ? clampPosition(state.player.position, rules.movementBounds)
      : advancePosition(
          state.player.position,
          (horizontalDirection / directionLength) *
            rules.playerSpeed *
            deltaSeconds,
          (verticalDirection / directionLength) *
            rules.playerSpeed *
            deltaSeconds,
          rules,
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
  input: InputSnapshot,
): FacingDirection => {
  if (horizontalDirection !== 0 && verticalDirection !== 0) {
    const lastPressedDirection = input.lastPressedDirection;

    if (
      lastPressedDirection &&
      isDirectionActive(input, lastPressedDirection)
    ) {
      return lastPressedDirection;
    }

    return verticalDirection > 0 ? 'down' : 'up';
  }

  if (verticalDirection !== 0) {
    return verticalDirection > 0 ? 'down' : 'up';
  }

  if (horizontalDirection !== 0) {
    return horizontalDirection > 0 ? 'right' : 'left';
  }

  return currentFacing;
};

const isDirectionActive = (
  input: InputSnapshot,
  direction: FacingDirection,
): boolean => input[direction];

const advancePosition = (
  position: PlayerPosition,
  deltaX: number,
  deltaY: number,
  rules: WorldRules,
): PlayerPosition => {
  const collision = rules.collision;
  const start = clampPosition(position, rules.movementBounds);

  if (!collision) {
    return clampPosition(
      {
        x: start.x + deltaX,
        y: start.y + deltaY,
      },
      rules.movementBounds,
    );
  }

  const distance = Math.hypot(deltaX, deltaY);
  const stepCount = Math.max(
    1,
    Math.ceil(distance / Math.max(collision.maxStep, 0.0001)),
  );
  const stepX = deltaX / stepCount;
  const stepY = deltaY / stepCount;
  let next = start;

  for (let step = 0; step < stepCount; step += 1) {
    next = tryMoveAxis(next, stepX, 0, rules);
    next = tryMoveAxis(next, 0, stepY, rules);
  }

  return next;
};

const tryMoveAxis = (
  position: PlayerPosition,
  deltaX: number,
  deltaY: number,
  rules: WorldRules,
): PlayerPosition => {
  const collision = rules.collision;
  if (!collision) {
    return position;
  }

  const candidate = clampPosition(
    {
      x: position.x + deltaX,
      y: position.y + deltaY,
    },
    rules.movementBounds,
  );

  if (collision.canOccupy(candidate, collision.collider)) {
    return candidate;
  }

  return findFurthestWalkablePosition(position, candidate, rules);
};

const findFurthestWalkablePosition = (
  start: PlayerPosition,
  blocked: PlayerPosition,
  rules: WorldRules,
): PlayerPosition => {
  const collision = rules.collision;
  if (!collision) {
    return start;
  }

  let low = 0;
  let high = 1;

  for (let iteration = 0; iteration < 16; iteration += 1) {
    const middle = (low + high) / 2;
    const candidate = interpolatePosition(start, blocked, middle);

    if (collision.canOccupy(candidate, collision.collider)) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return interpolatePosition(start, blocked, low);
};

const interpolatePosition = (
  start: PlayerPosition,
  end: PlayerPosition,
  amount: number,
): PlayerPosition => ({
  x: start.x + (end.x - start.x) * amount,
  y: start.y + (end.y - start.y) * amount,
});

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
