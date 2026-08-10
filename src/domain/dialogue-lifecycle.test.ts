import { describe, expect, it } from 'vitest';
import {
  LEAH,
  ROAD_WORLD_RULES,
} from './road-map';
import {
  advanceWorld,
  createWorldState,
  type InputSnapshot,
  type WorldState,
} from './world-state';

const NO_INPUT: InputSnapshot = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const eligibleWorld = (): WorldState => {
  const position = {
    x: LEAH.position.x - 32,
    y: LEAH.position.y,
  };
  const approach = createWorldState(position);

  return advanceWorld(
    {
      ...approach,
      player: {
        ...approach.player,
        facing: 'right',
      },
    },
    NO_INPUT,
    0,
    ROAD_WORLD_RULES,
  );
};

describe('dialogue lifecycle', () => {
  it('rejects an interaction intent when no target is eligible', () => {
    const state = createWorldState({ x: 100, y: 100 });

    const next = advanceWorld(
      state,
      { ...NO_INPUT, interactionPressed: true },
      0,
      ROAD_WORLD_RULES,
    );

    expect(next.dialogue.npcId).toBeNull();
    expect(next.player.position).toEqual(state.player.position);
  });

  it('opens Leah dialogue and stays idle without moving on the opening press', () => {
    const state = eligibleWorld();

    const next = advanceWorld(
      state,
      { ...NO_INPUT, right: true, interactionPressed: true },
      0.5,
      ROAD_WORLD_RULES,
    );

    expect(next.dialogue.npcId).toBe('leah');
    expect(next.interaction.targetId).toBeNull();
    expect(next.player.position).toEqual(state.player.position);
    expect(next.player.isMoving).toBe(false);
  });

  it('locks movement for every frame while dialogue is open', () => {
    const open = advanceWorld(
      eligibleWorld(),
      { ...NO_INPUT, interactionPressed: true },
      0,
      ROAD_WORLD_RULES,
    );

    const next = advanceWorld(
      open,
      { ...NO_INPUT, left: true },
      0.5,
      ROAD_WORLD_RULES,
    );

    expect(next.dialogue.npcId).toBe('leah');
    expect(next.player.position).toEqual(open.player.position);
    expect(next.player.isMoving).toBe(false);
  });

  it('closes on the next interaction intent and resumes movement', () => {
    const open = advanceWorld(
      eligibleWorld(),
      { ...NO_INPUT, interactionPressed: true },
      0,
      ROAD_WORLD_RULES,
    );

    const next = advanceWorld(
      open,
      { ...NO_INPUT, left: true, interactionPressed: true },
      0.1,
      ROAD_WORLD_RULES,
    );

    expect(next.dialogue.npcId).toBeNull();
    expect(next.player.position.x).toBeLessThan(open.player.position.x);
    expect(next.player.isMoving).toBe(true);
  });
});
