export const DIALOGUE_PANEL_WIDTH_RATIO = 0.8;
export const DIALOGUE_PANEL_HEIGHT = 136;
export const DIALOGUE_PANEL_MARGIN_BOTTOM = 16;
export const DIALOGUE_PANEL_PADDING = 20;
export const DIALOGUE_NAME_HEIGHT = 28;
export const DIALOGUE_PORTRAIT_WIDTH = 96;
export const DIALOGUE_PORTRAIT_HEIGHT = 96;
export const DIALOGUE_PORTRAIT_GAP = 16;

interface DialogueRectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface DialoguePanelLayout {
  readonly panel: DialogueRectangle;
  readonly name: {
    readonly x: number;
    readonly y: number;
  };
  readonly text: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
  };
  readonly portrait: DialogueRectangle | null;
}

export const getDialoguePanelLayout = (
  viewportWidth: number,
  viewportHeight: number,
  hasPortrait: boolean,
): DialoguePanelLayout => {
  const panelWidth = Math.floor(viewportWidth * DIALOGUE_PANEL_WIDTH_RATIO);
  const panel: DialogueRectangle = {
    x: Math.floor((viewportWidth - panelWidth) / 2),
    y: viewportHeight - DIALOGUE_PANEL_MARGIN_BOTTOM - DIALOGUE_PANEL_HEIGHT,
    width: panelWidth,
    height: DIALOGUE_PANEL_HEIGHT,
  };
  const portraitWidth = hasPortrait
    ? DIALOGUE_PORTRAIT_WIDTH + DIALOGUE_PORTRAIT_GAP
    : 0;
  const portrait = hasPortrait
    ? {
        x: panel.x + DIALOGUE_PANEL_PADDING,
        y: panel.y + DIALOGUE_PANEL_PADDING,
        width: DIALOGUE_PORTRAIT_WIDTH,
        height: DIALOGUE_PORTRAIT_HEIGHT,
      }
    : null;

  return {
    panel,
    name: {
      x: panel.x + DIALOGUE_PANEL_PADDING + portraitWidth,
      y: panel.y + DIALOGUE_PANEL_PADDING,
    },
    text: {
      x: panel.x + DIALOGUE_PANEL_PADDING + portraitWidth,
      y: panel.y + DIALOGUE_PANEL_PADDING + DIALOGUE_NAME_HEIGHT,
      width: panel.width - DIALOGUE_PANEL_PADDING * 2 - portraitWidth,
    },
    portrait,
  };
};
