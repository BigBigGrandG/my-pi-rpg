import { describe, expect, it } from 'vitest';
import {
  createInteractionInputState,
  recordInteractionInput,
} from './interaction-input';

describe('interaction input', () => {
  it('does not create an interaction intent while J is up', () => {
    const result = recordInteractionInput(
      createInteractionInputState(),
      false,
    );

    expect(result.pressed).toBe(false);
  });

  it('turns a fresh key-down into one interaction press', () => {
    let state = createInteractionInputState();

    let result = recordInteractionInput(state, true);
    expect(result.pressed).toBe(true);
    state = result.state;

    result = recordInteractionInput(state, true);
    expect(result.pressed).toBe(false);
  });

  it('allows another press only after the key is released', () => {
    let state = createInteractionInputState();

    state = recordInteractionInput(state, true).state;
    state = recordInteractionInput(state, false).state;

    const result = recordInteractionInput(state, true);
    expect(result.pressed).toBe(true);
  });
});
