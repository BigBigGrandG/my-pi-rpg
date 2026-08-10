import { describe, expect, it } from 'vitest';
import {
  advanceWorld,
  createWorldState,
  type InputSnapshot,
  type WorldRules,
  type WorldState,
} from './world-state';

const RULES: WorldRules = {
  playerSpeed: 200,
  movementBounds: {
    width: 960,
    height: 540,
    playerSize: 32,
  },
};

const NO_INPUT: InputSnapshot = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const INITIAL_WORLD: WorldState = {
  player: {
    position: { x: 100, y: 100 },
    facing: 'down',
    isMoving: false,
  },
  interaction: {
    targetId: null,
  },
  dialogue: {
    npcId: null,
  },
};

describe('advanceWorld', () => {
  it('creates an idle world with future state slots empty', () => {
    expect(createWorldState({ x: 100, y: 100 })).toEqual(INITIAL_WORLD);
  });

  it('advances the player and returns the actual movement state', () => {
    expect(
      advanceWorld(
        INITIAL_WORLD,
        { ...NO_INPUT, right: true },
        0.5,
        RULES,
      ),
    ).toEqual({
      ...INITIAL_WORLD,
      player: {
        position: { x: 200, y: 100 },
        facing: 'right',
        isMoving: true,
      },
    });
  });

  it('normalizes diagonal movement and prefers the vertical facing', () => {
    const next = advanceWorld(
      INITIAL_WORLD,
      { ...NO_INPUT, up: true, right: true },
      0.5,
      RULES,
    );

    expect(
      Math.hypot(
        next.player.position.x - INITIAL_WORLD.player.position.x,
        next.player.position.y - INITIAL_WORLD.player.position.y,
      ),
    ).toBeCloseTo(100);
    expect(next.player.position.x - INITIAL_WORLD.player.position.x).toBeCloseTo(
      100 / Math.sqrt(2),
    );
    expect(next.player.position.y - INITIAL_WORLD.player.position.y).toBeCloseTo(
      -100 / Math.sqrt(2),
    );
    expect(next.player.facing).toBe('up');
    expect(next.player.isMoving).toBe(true);
  });

  it('uses a recent active cardinal direction for diagonal facing', () => {
    const next = advanceWorld(
      INITIAL_WORLD,
      { ...NO_INPUT, up: true, right: true, lastPressedDirection: 'right' },
      0.5,
      RULES,
    );

    expect(next.player.facing).toBe('right');
    expect(next.player.isMoving).toBe(true);
  });

  it('cancels opposing directions before moving on the remaining axis', () => {
    const next = advanceWorld(
      INITIAL_WORLD,
      { ...NO_INPUT, left: true, right: true, up: true },
      0.5,
      RULES,
    );

    expect(next.player.position).toEqual({ x: 100, y: 16 });
    expect(next.player.facing).toBe('up');
    expect(next.player.isMoving).toBe(true);
  });

  it('preserves future state and becomes idle when no position changes', () => {
    const movingWorld: WorldState = {
      ...INITIAL_WORLD,
      player: {
        position: { x: 200, y: 100 },
        facing: 'right',
        isMoving: true,
      },
      interaction: {
        targetId: 'leah',
      },
      dialogue: {
        npcId: 'leah',
      },
    };

    expect(advanceWorld(movingWorld, NO_INPUT, 0.5, RULES)).toEqual({
      ...movingWorld,
      player: {
        ...movingWorld.player,
        isMoving: false,
      },
    });
  });

  it('clamps every screen edge and reports a blocked direction as idle', () => {
    const start = INITIAL_WORLD.player.position;

    for (const [direction, position] of [
      ['left', { x: 16, y: start.y }],
      ['right', { x: 944, y: start.y }],
      ['up', { x: start.x, y: 16 }],
      ['down', { x: start.x, y: 524 }],
    ] as const) {
      const input = { ...NO_INPUT, [direction]: true } as InputSnapshot;
      const next = advanceWorld(
        {
          ...INITIAL_WORLD,
          player: {
            ...INITIAL_WORLD.player,
            position,
          },
        },
        input,
        0.5,
        RULES,
      );

      expect(next.player.position).toEqual(position);
      expect(next.player.facing).toBe(direction);
      expect(next.player.isMoving).toBe(false);
    }
  });
});
