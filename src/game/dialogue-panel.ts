import type { DialogueDefinition } from '../domain/dialogue';
import { getDialoguePanelLayout } from './dialogue-presentation';
import type { GameObjects, Scene } from 'phaser';

export const createDialoguePanel = (
  scene: Scene,
  dialogue: DialogueDefinition,
  viewportWidth: number,
  viewportHeight: number,
): GameObjects.Container => {
  const portraitKey = dialogue.portraitKey && scene.textures.exists(dialogue.portraitKey)
    ? dialogue.portraitKey
    : undefined;
  const layout = getDialoguePanelLayout(
    viewportWidth,
    viewportHeight,
    portraitKey !== undefined,
  );
  const panelCenterX = layout.panel.x + layout.panel.width / 2;
  const panelCenterY = layout.panel.y + layout.panel.height / 2;
  const panel = scene.add
    .container(panelCenterX, panelCenterY)
    .setScrollFactor(0)
    .setDepth(20);
  const background = scene.add.graphics();
  background.fillStyle(0x1b1a27, 0.97);
  background.fillRect(
    -layout.panel.width / 2,
    -layout.panel.height / 2,
    layout.panel.width,
    layout.panel.height,
  );
  background.lineStyle(4, 0x0b2118, 1);
  background.strokeRect(
    -layout.panel.width / 2,
    -layout.panel.height / 2,
    layout.panel.width,
    layout.panel.height,
  );
  background.lineStyle(2, 0x5c4639, 1);
  background.strokeRect(
    -layout.panel.width / 2 + 7,
    -layout.panel.height / 2 + 7,
    layout.panel.width - 14,
    layout.panel.height - 14,
  );

  const name = scene.add.text(
    layout.name.x - panelCenterX,
    layout.name.y - panelCenterY,
    dialogue.speakerName,
    {
      color: '#f5d37b',
      fontFamily: 'Segoe UI, Microsoft YaHei, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    },
  );
  const text = scene.add.text(
    layout.text.x - panelCenterX,
    layout.text.y - panelCenterY,
    dialogue.text,
    {
      color: '#f4f0e6',
      fontFamily: 'Segoe UI, Microsoft YaHei, sans-serif',
      fontSize: '18px',
      lineSpacing: 8,
      wordWrap: {
        width: layout.text.width,
      },
    },
  );

  panel.add([background, name, text]);
  if (layout.portrait !== null && portraitKey !== undefined) {
    panel.add(
      scene.add
        .image(
          layout.portrait.x + layout.portrait.width / 2 - panelCenterX,
          layout.portrait.y + layout.portrait.height / 2 - panelCenterY,
          portraitKey,
        )
        .setOrigin(0.5)
        .setDisplaySize(
          layout.portrait.width,
          layout.portrait.height,
        ),
    );
  }

  return panel;
};
