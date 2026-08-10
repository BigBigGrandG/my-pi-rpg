import { describe, expect, it } from 'vitest';
import {
  isRoadWalkable,
  LEAH,
  LEAH_INTERACTION_DISTANCE,
  ROAD_MAP,
  ROAD_PLAYER_COLLIDER,
  ROAD_WORLD_RULES,
} from './road-map';
import { advanceWorld, createWorldState, type InputSnapshot } from './world-state';

const RIGHT_INPUT: InputSnapshot = {
  up: false,
  down: false,
  left: false,
  right: true,
};

describe('ROAD_MAP', () => {
  it('defines the 60 by 40 road grid and southwest spawn', () => {
    expect({
      tileSize: ROAD_MAP.tileSize,
      columns: ROAD_MAP.columns,
      rows: ROAD_MAP.rows,
      worldWidth: ROAD_MAP.worldWidth,
      worldHeight: ROAD_MAP.worldHeight,
      verticalRoads: ROAD_MAP.verticalRoads,
      horizontalRoads: ROAD_MAP.horizontalRoads,
      playerSpawn: ROAD_MAP.playerSpawn,
    }).toEqual({
      tileSize: 32,
      columns: 60,
      rows: 40,
      worldWidth: 1920,
      worldHeight: 1280,
      verticalRoads: [
        { start: 10, end: 12 },
        { start: 29, end: 31 },
        { start: 48, end: 50 },
      ],
      horizontalRoads: [
        { start: 7, end: 9 },
        { start: 19, end: 21 },
        { start: 31, end: 33 },
      ],
      playerSpawn: { x: 368, y: 1040 },
    });
  });

  it('accepts road and intersection positions but rejects grass', () => {
    expect(isRoadWalkable({ x: 368, y: 400 }, ROAD_PLAYER_COLLIDER)).toBe(true);
    expect(isRoadWalkable({ x: 600, y: 656 }, ROAD_PLAYER_COLLIDER)).toBe(true);
    expect(isRoadWalkable({ x: 368, y: 656 }, ROAD_PLAYER_COLLIDER)).toBe(true);
    expect(isRoadWalkable({ x: 600, y: 400 }, ROAD_PLAYER_COLLIDER)).toBe(false);
  });

  it('moves at 160 pixels per second on a walkable road', () => {
    const next = advanceWorld(
      createWorldState(ROAD_MAP.playerSpawn),
      RIGHT_INPUT,
      0.5,
      ROAD_WORLD_RULES,
    );

    expect(next.player.position).toEqual({ x: 448, y: 1040 });
    expect(next.player.isMoving).toBe(true);
  });

  it('slides along the road edge when a diagonal axis is blocked', () => {
    const next = advanceWorld(
      createWorldState({ x: 368, y: 400 }),
      { up: true, down: false, left: false, right: true },
      0.5,
      ROAD_WORLD_RULES,
    );

    expect(next.player.position.x).toBeCloseTo(408, 3);
    expect(next.player.position.y).toBeCloseTo(400 - 80 / Math.sqrt(2), 3);
    expect(next.player.isMoving).toBe(true);
  });

  it('does not tunnel across grass during a large frame', () => {
    const next = advanceWorld(
      createWorldState({ x: 368, y: 400 }),
      RIGHT_INPUT,
      10,
      ROAD_WORLD_RULES,
    );

    expect(next.player.position).toEqual({ x: 408, y: 400 });
    expect(next.player.isMoving).toBe(true);
  });

  it('keeps the player inside the world at road exits', () => {
    const rightEdge = advanceWorld(
      createWorldState({ x: 600, y: 640 }),
      RIGHT_INPUT,
      20,
      ROAD_WORLD_RULES,
    );
    const topEdge = advanceWorld(
      createWorldState({ x: 368, y: 1040 }),
      { up: true, down: false, left: false, right: false },
      20,
      ROAD_WORLD_RULES,
    );

    expect(rightEdge.player.position).toEqual({ x: 1904, y: 640 });
    expect(topEdge.player.position).toEqual({ x: 368, y: 16 });
  });

  it('stays idle while blocked but updates the attempted facing', () => {
    const next = advanceWorld(
      createWorldState({ x: 408, y: 400 }),
      RIGHT_INPUT,
      0.5,
      ROAD_WORLD_RULES,
    );

    expect(next.player.position).toEqual({ x: 408, y: 400 });
    expect(next.player.facing).toBe('right');
    expect(next.player.isMoving).toBe(false);
  });

  it('places Leah east of the central intersection on the middle road', () => {
    expect(LEAH.position).toEqual({ x: 1136, y: 656 });
    expect(LEAH_INTERACTION_DISTANCE).toBe(48);
    expect(isRoadWalkable(LEAH.position, LEAH.collider)).toBe(true);
  });

  it('shows Leah as the interaction target inside and at the distance threshold', () => {
    for (const distance of [47, LEAH_INTERACTION_DISTANCE]) {
      const next = advanceWorld(
        {
          ...createWorldState({
            x: LEAH.position.x - distance,
            y: LEAH.position.y,
          }),
          player: {
            ...createWorldState({ x: 0, y: 0 }).player,
            position: {
              x: LEAH.position.x - distance,
              y: LEAH.position.y,
            },
            facing: 'right',
          },
        },
        { up: false, down: false, left: false, right: false },
        0,
        ROAD_WORLD_RULES,
      );

      expect(next.interaction.targetId).toBe('leah');
    }
  });

  it('hides Leah as the interaction target outside the distance threshold', () => {
    const distance = LEAH_INTERACTION_DISTANCE + 1;
    const state = createWorldState({
      x: LEAH.position.x - distance,
      y: LEAH.position.y,
    });

    const next = advanceWorld(
      {
        ...state,
        player: {
          ...state.player,
          facing: 'right',
        },
      },
      { up: false, down: false, left: false, right: false },
      0,
      ROAD_WORLD_RULES,
    );

    expect(next.interaction.targetId).toBeNull();
  });

  it('accepts every cardinal approach and rejects a backward-facing approach', () => {
    for (const approach of [
      { position: { x: LEAH.position.x - 32, y: LEAH.position.y }, facing: 'right' },
      { position: { x: LEAH.position.x + 32, y: LEAH.position.y }, facing: 'left' },
      { position: { x: LEAH.position.x, y: LEAH.position.y - 32 }, facing: 'down' },
      { position: { x: LEAH.position.x, y: LEAH.position.y + 32 }, facing: 'up' },
    ] as const) {
      const state = createWorldState(approach.position);
      const next = advanceWorld(
        {
          ...state,
          player: {
            ...state.player,
            facing: approach.facing,
          },
        },
        { up: false, down: false, left: false, right: false },
        0,
        ROAD_WORLD_RULES,
      );

      expect(next.interaction.targetId).toBe('leah');
    }

    const state = createWorldState({
      x: LEAH.position.x - 32,
      y: LEAH.position.y,
    });
    const next = advanceWorld(
      {
        ...state,
        player: {
          ...state.player,
          facing: 'left',
        },
      },
      { up: false, down: false, left: false, right: false },
      0,
      ROAD_WORLD_RULES,
    );

    expect(next.interaction.targetId).toBeNull();
  });

  it('hides Leah while dialogue is open', () => {
    const state = createWorldState({
      x: LEAH.position.x - 32,
      y: LEAH.position.y,
    });

    const next = advanceWorld(
      {
        ...state,
        player: {
          ...state.player,
          facing: 'right',
        },
        dialogue: {
          npcId: 'leah',
        },
      },
      { up: false, down: false, left: false, right: false },
      0,
      ROAD_WORLD_RULES,
    );

    expect(next.interaction.targetId).toBeNull();
  });

  it('blocks movement through Leah and keeps diagonal movement sliding on the free axis', () => {
    const blocked = advanceWorld(
      createWorldState({
        x: LEAH.position.x - 16,
        y: LEAH.position.y,
      }),
      { up: false, down: false, left: false, right: true },
      10,
      ROAD_WORLD_RULES,
    );

    expect(blocked.player.position.x).toBeCloseTo(LEAH.position.x - 16, 3);
    expect(blocked.player.position.y).toBe(LEAH.position.y);

    const sliding = advanceWorld(
      createWorldState({
        x: LEAH.position.x - 16,
        y: LEAH.position.y,
      }),
      { up: true, down: false, left: false, right: true },
      0.1,
      ROAD_WORLD_RULES,
    );

    expect(sliding.player.position.x).toBeCloseTo(LEAH.position.x - 16, 3);
    expect(sliding.player.position.y).toBeLessThan(LEAH.position.y);
    expect(sliding.player.isMoving).toBe(true);
  });
});
