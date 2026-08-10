import { describe, expect, it } from 'vitest';
import { LEAH } from '../domain/road-map';
import { createWorldState } from '../domain/world-state';
import {
  getLeahPromptPosition,
  getNpcShadowPosition,
  getNpcSpritePosition,
  shouldShowLeahPrompt,
} from './npc-presentation';

describe('NPC presentation', () => {
  it('anchors Leah’s sprite and shadow to her domain foot position', () => {
    expect(getNpcSpritePosition(LEAH.position)).toEqual({ x: 1136, y: 648 });
    expect(getNpcShadowPosition(LEAH.position)).toEqual({ x: 1136, y: 671 });
  });

  it('places the interaction prompt above Leah and hides it during dialogue', () => {
    expect(getLeahPromptPosition(LEAH.position)).toEqual({ x: 1136, y: 608 });

    const eligible = {
      ...createWorldState(LEAH.position),
      interaction: { targetId: 'leah' },
    };
    expect(shouldShowLeahPrompt(eligible)).toBe(true);
    expect(shouldShowLeahPrompt({
      ...eligible,
      dialogue: { npcId: 'leah' },
    })).toBe(false);
  });
});
