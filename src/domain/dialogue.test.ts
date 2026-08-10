import { describe, expect, it } from 'vitest';
import { LEAH_ID } from './road-map';
import { getDialogueDefinition, type DialogueDefinition } from './dialogue';

describe('dialogue definitions', () => {
  it('provides Leah’s fixed greeting without requiring a portrait', () => {
    const dialogue = getDialogueDefinition(LEAH_ID);

    expect(dialogue).toEqual({
      npcId: 'leah',
      speakerName: '莉亚',
      text: '你好！今天也要精神满满地生活呀。',
    });
    expect(dialogue?.portraitKey).toBeUndefined();
  });

  it('keeps portrait data optional for future NPC presentation', () => {
    const futureDialogue: DialogueDefinition = {
      npcId: 'future-npc',
      speakerName: '未来角色',
      text: '你好。',
      portraitKey: 'npc-future',
    };

    expect(futureDialogue.portraitKey).toBe('npc-future');
    expect(getDialogueDefinition('unknown-npc')).toBeNull();
  });
});
