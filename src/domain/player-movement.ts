export const PLAYER_SPEED = 200;

export interface PlayerPosition {
  readonly x: number;
  readonly y: number;
}

export interface MovementInput {
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

export const advancePlayer = (
  position: PlayerPosition,
  input: MovementInput,
  deltaSeconds: number,
  bounds: MovementBounds,
): PlayerPosition => {
  const horizontalDirection = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const verticalDirection = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const directionLength = Math.hypot(horizontalDirection, verticalDirection);

  if (directionLength === 0 || deltaSeconds <= 0) {
    return clampPosition(position, bounds);
  }

  const distance = PLAYER_SPEED * deltaSeconds;
  const nextPosition: PlayerPosition = {
    x: position.x + (horizontalDirection / directionLength) * distance,
    y: position.y + (verticalDirection / directionLength) * distance,
  };

  return clampPosition(nextPosition, bounds);
};

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
