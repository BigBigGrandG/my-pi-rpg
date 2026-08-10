import type {
  FacingDirection,
  InputSnapshot,
} from '../domain/world-state';

export type DirectionalInput = Pick<
  InputSnapshot,
  'up' | 'down' | 'left' | 'right'
>;

export interface InputHistory {
  readonly previousInput: DirectionalInput;
  readonly lastPressedDirection?: FacingDirection;
}

const DIRECTIONS: readonly FacingDirection[] = [
  'up',
  'down',
  'left',
  'right',
];

export const createInputHistory = (): InputHistory => ({
  previousInput: {
    up: false,
    down: false,
    left: false,
    right: false,
  },
});

export const recordInput = (
  history: InputHistory,
  input: DirectionalInput,
): InputHistory => {
  const newlyPressedDirections = DIRECTIONS.filter(
    (direction) => input[direction] && !history.previousInput[direction],
  );
  let lastPressedDirection = history.lastPressedDirection;

  if (newlyPressedDirections.length === 1) {
    lastPressedDirection = newlyPressedDirections[0];
  } else if (newlyPressedDirections.length > 1) {
    lastPressedDirection = undefined;
  }

  return {
    previousInput: { ...input },
    lastPressedDirection,
  };
};
