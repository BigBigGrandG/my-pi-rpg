import { describe, expect, it } from 'vitest';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_SIZE,
} from './game-config';

describe('MVP game configuration', () => {
  it('keeps the fixed desktop viewport and placeholder size', () => {
    expect({ GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE }).toEqual({
      GAME_WIDTH: 960,
      GAME_HEIGHT: 540,
      PLAYER_SIZE: 32,
    });
  });
});
