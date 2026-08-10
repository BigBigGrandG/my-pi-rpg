import { describe, expect, it } from 'vitest';
import {
  DIALOGUE_PANEL_WIDTH_RATIO,
  getDialoguePanelLayout,
} from './dialogue-presentation';

describe('dialogue presentation', () => {
  it('anchors a panel to the bottom center at roughly eighty percent width', () => {
    const layout = getDialoguePanelLayout(960, 540, false);

    expect(layout.panel.width / 960).toBeCloseTo(DIALOGUE_PANEL_WIDTH_RATIO);
    expect(layout.panel.x).toBe(96);
    expect(layout.panel.y + layout.panel.height).toBe(524);
    expect(layout.panel.x + layout.panel.width / 2).toBe(480);
    expect(layout.portrait).toBeNull();
  });

  it('uses the full text area when no portrait is available', () => {
    const withoutPortrait = getDialoguePanelLayout(960, 540, false);
    const withPortrait = getDialoguePanelLayout(960, 540, true);

    expect(withoutPortrait.text.width).toBeGreaterThan(withPortrait.text.width);
    expect(withPortrait.portrait).not.toBeNull();
    expect(withPortrait.text.x).toBeGreaterThan(withoutPortrait.text.x);
    expect(withPortrait.name.x).toBe(withPortrait.text.x);
    expect(withPortrait.name.x).toBeGreaterThan(withPortrait.portrait?.x ?? 0);
  });
});
