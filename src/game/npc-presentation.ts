import { LEAH_ID } from '../domain/road-map';
import type { PlayerPosition, WorldState } from '../domain/world-state';

export const NPC_SPRITE_OFFSET_Y = -8;
export const NPC_SHADOW_OFFSET_Y = 15;
export const NPC_SHADOW_WIDTH = 22;
export const NPC_SHADOW_HEIGHT = 7;
export const LEAH_PROMPT_OFFSET_Y = -48;

export interface NpcRenderPosition {
  readonly x: number;
  readonly y: number;
}

export const getNpcSpritePosition = (
  position: PlayerPosition,
): NpcRenderPosition => ({
  x: position.x,
  y: position.y + NPC_SPRITE_OFFSET_Y,
});

export const getNpcShadowPosition = (
  position: PlayerPosition,
): NpcRenderPosition => ({
  x: position.x,
  y: position.y + NPC_SHADOW_OFFSET_Y,
});

export const getLeahPromptPosition = (
  position: PlayerPosition,
): NpcRenderPosition => ({
  x: position.x,
  y: position.y + LEAH_PROMPT_OFFSET_Y,
});

export const shouldShowLeahPrompt = (worldState: WorldState): boolean =>
  worldState.dialogue.npcId === null && worldState.interaction.targetId === LEAH_ID;
