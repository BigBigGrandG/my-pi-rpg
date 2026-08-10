import { LEAH_ID } from './road-map';

export interface DialogueDefinition {
  readonly npcId: string;
  readonly speakerName: string;
  readonly text: string;
  readonly portraitKey?: string;
}

const DIALOGUE_DEFINITIONS: Readonly<Record<string, DialogueDefinition>> = {
  [LEAH_ID]: {
    npcId: LEAH_ID,
    speakerName: '莉亚',
    text: '你好！今天也要精神满满地生活呀。',
  },
};

export const getDialogueDefinition = (
  npcId: string,
): DialogueDefinition | null => DIALOGUE_DEFINITIONS[npcId] ?? null;
