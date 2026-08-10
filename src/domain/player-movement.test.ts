import { describe, expect, it } from 'vitest';
import { advancePlayer, type MovementBounds, type MovementInput } from './player-movement';

const BOUNDS: MovementBounds = {
  width: 960,
  height: 540,
  playerSize: 32,
};

const NO_INPUT: MovementInput = {
  up: false,
  down: false,
  left: false,
  right: false,
};

describe('advancePlayer', () => {
  it('moves right at 160 pixels per second', () => {
    expect(advancePlayer({ x: 100, y: 100 }, { ...NO_INPUT, right: true }, 0.5, BOUNDS)).toEqual({
      x: 180,
      y: 100,
    });
  });

  it('moves vertically and normalizes diagonal speed', () => {
    expect(advancePlayer({ x: 100, y: 100 }, { ...NO_INPUT, down: true }, 0.5, BOUNDS)).toEqual({
      x: 100,
      y: 180,
    });

    const start = { x: 480, y: 270 };
    const diagonal = advancePlayer(
      start,
      { ...NO_INPUT, up: true, right: true },
      0.5,
      BOUNDS,
    );

    expect(Math.hypot(diagonal.x - start.x, diagonal.y - start.y)).toBeCloseTo(80);
    expect(diagonal.x - start.x).toBeCloseTo(80 / Math.sqrt(2));
    expect(diagonal.y - start.y).toBeCloseTo(-80 / Math.sqrt(2));
  });

  it('cancels opposite inputs while allowing the other axis to move', () => {
    expect(
      advancePlayer(
        { x: 100, y: 100 },
        { ...NO_INPUT, left: true, right: true, up: true },
        0.5,
        BOUNDS,
      ),
    ).toEqual({ x: 100, y: 20 });

    expect(
      advancePlayer(
        { x: 100, y: 100 },
        { ...NO_INPUT, up: true, down: true, right: true },
        0.5,
        BOUNDS,
      ),
    ).toEqual({ x: 180, y: 100 });
  });

  it('stops immediately without input and scales movement by frame time', () => {
    const start = { x: 100, y: 100 };

    expect(advancePlayer(start, NO_INPUT, 0.5, BOUNDS)).toEqual(start);
    const moved = advancePlayer(start, { ...NO_INPUT, right: true }, 0.25, BOUNDS);
    expect(advancePlayer(moved, NO_INPUT, 0.5, BOUNDS)).toEqual(moved);
    expect(
      advancePlayer(
        moved,
        { ...NO_INPUT, right: true },
        0.25,
        BOUNDS,
      ),
    ).toEqual({ x: 180, y: 100 });
  });

  it('keeps the complete player inside all four field edges', () => {
    const start = { x: 480, y: 270 };

    expect(advancePlayer(start, { ...NO_INPUT, left: true }, 10, BOUNDS).x).toBe(16);
    expect(advancePlayer(start, { ...NO_INPUT, right: true }, 10, BOUNDS).x).toBe(944);
    expect(advancePlayer(start, { ...NO_INPUT, up: true }, 10, BOUNDS).y).toBe(16);
    expect(advancePlayer(start, { ...NO_INPUT, down: true }, 10, BOUNDS).y).toBe(524);
  });
});
