import { describe, expect, it } from 'vitest';
import {
  createInputHistory,
  recordInput,
} from './input-history';

const NO_INPUT = {
  up: false,
  down: false,
  left: false,
  right: false,
} as const;

describe('input history', () => {
  it('records the most recently pressed active direction', () => {
    let history = createInputHistory();

    history = recordInput(history, { ...NO_INPUT, right: true });
    expect(history.lastPressedDirection).toBe('right');

    history = recordInput(history, { ...NO_INPUT, right: true, up: true });
    expect(history.lastPressedDirection).toBe('up');
  });

  it('requires a fresh press before replacing the remembered direction', () => {
    let history = recordInput(createInputHistory(), {
      ...NO_INPUT,
      right: true,
    });

    history = recordInput(history, { ...NO_INPUT, right: true, up: true });
    history = recordInput(history, { ...NO_INPUT, right: true });
    expect(history.lastPressedDirection).toBe('up');

    history = recordInput(history, NO_INPUT);
    history = recordInput(history, { ...NO_INPUT, right: true });
    expect(history.lastPressedDirection).toBe('right');
  });

  it('starts with no remembered direction after a reset', () => {
    expect(createInputHistory().lastPressedDirection).toBeUndefined();
  });

  it('does not invent an order when multiple directions arrive together', () => {
    const history = recordInput(createInputHistory(), {
      ...NO_INPUT,
      up: true,
      right: true,
    });

    expect(history.lastPressedDirection).toBeUndefined();
  });
});
