import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import {
  RUNTIME_DECORATION_ASSETS,
  type RuntimeDecorationAssetContract,
} from './runtime-assets';

const workspaceRoot = resolve(
  fileURLToPath(new URL('../..', import.meta.url)),
);

const readPng = (relativePath: string): PNG =>
  PNG.sync.read(readFileSync(resolve(workspaceRoot, relativePath)));

const readRuntimeAsset = (asset: RuntimeDecorationAssetContract): PNG =>
  readPng(asset.path);

const readSourceAsset = (asset: RuntimeDecorationAssetContract): PNG =>
  readPng(asset.sourcePath);

describe('runtime decoration asset contracts', () => {
  it('keeps every supplied source separate from its runtime derivative', () => {
    const assets = [
      ...Object.values(RUNTIME_DECORATION_ASSETS.buildings),
      ...Object.values(RUNTIME_DECORATION_ASSETS.environment),
    ];

    for (const asset of assets) {
      const source = readSourceAsset(asset);
      expect([source.width, source.height]).toEqual([
        asset.sourceWidth,
        asset.sourceHeight,
      ]);
      expect(asset.sourcePath).not.toBe(asset.path);
      expect(asset.anchor).toEqual({ x: 0.5, y: 1 });
    }
  });

  it('publishes the agreed transparent runtime dimensions and bottom anchors', () => {
    expect(RUNTIME_DECORATION_ASSETS.buildings).toMatchObject({
      'player-house': { width: 192, height: 160, opaque: false },
      'general-store': { width: 192, height: 160, opaque: false },
      clinic: { width: 192, height: 160, opaque: false },
      blacksmith: { width: 192, height: 160, opaque: false },
      inn: { width: 192, height: 160, opaque: false },
      'ranch-store': { width: 192, height: 160, opaque: false },
    });
    expect(RUNTIME_DECORATION_ASSETS.environment).toMatchObject({
      'tree-spring': { width: 64, height: 96, opaque: false },
      'bush-spring': { width: 32, height: 32, opaque: false },
      'pond-spring': { width: 192, height: 128, opaque: false },
      'fence-horizontal': { width: 32, height: 32, opaque: false },
      'fence-vertical': { width: 32, height: 32, opaque: false },
    });
  });

  it('cleans the source glow while retaining visible artwork', () => {
    const assets = [
      ...Object.values(RUNTIME_DECORATION_ASSETS.buildings),
      ...Object.values(RUNTIME_DECORATION_ASSETS.environment),
    ];

    for (const asset of assets) {
      const image = readRuntimeAsset(asset);
      expect([image.width, image.height]).toEqual([asset.width, asset.height]);
      const alphaValues = new Set<number>();
      let visiblePixels = 0;
      for (let index = 3; index < image.data.length; index += 4) {
        const alpha = image.data[index];
        alphaValues.add(alpha);
        if (alpha > 0) {
          visiblePixels += 1;
        }
      }

      expect(alphaValues).toEqual(new Set([0, 255]));
      expect(visiblePixels).toBeGreaterThan(0);
      expect(visiblePixels).toBeLessThan(image.width * image.height);
    }
  });
});
