export interface InteractionInputState {
  readonly previousPressed: boolean;
}

export interface InteractionInputResult {
  readonly state: InteractionInputState;
  readonly pressed: boolean;
}

export const createInteractionInputState = (): InteractionInputState => ({
  previousPressed: false,
});

export const recordInteractionInput = (
  state: InteractionInputState,
  isPressed: boolean,
): InteractionInputResult => ({
  state: {
    previousPressed: isPressed,
  },
  pressed: isPressed && !state.previousPressed,
});
