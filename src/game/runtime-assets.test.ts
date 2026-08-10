import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import {
  RUNTIME_ASSETS,
  RUNTIME_ASSET_IDS,
  type RuntimeAssetContract,
} from './runtime-assets';

const workspaceRoot = resolve(
  fileURLToPath(new URL('../..', import.meta.url)),
);

const readRuntimeAsset = (asset: RuntimeAssetContract): PNG =>
  PNG.sync.read(readFileSync(resolve(workspaceRoot, asset.path)));

const readSourceAsset = (asset: RuntimeAssetContract): PNG =>
  PNG.sync.read(readFileSync(resolve(workspaceRoot, asset.sourcePath)));

const getPixel = (image: PNG, x: number, y: number): readonly number[] => {
  const offset = (y * image.width + x) * 4;
  return Array.from(image.data.subarray(offset, offset + 4));
};

describe('runtime asset contracts', () => {
  it('publishes stable identities with separate source and runtime paths', () => {
    expect(RUNTIME_ASSET_IDS).toEqual(['grass-spring', 'road-dirt', 'player-male']);
    expect(Object.values(RUNTIME_ASSETS).map((asset) => asset.id)).toEqual(
      RUNTIME_ASSET_IDS,
    );
    expect(Object.values(RUNTIME_ASSETS).every((asset) => asset.sourcePath !== asset.path)).toBe(
      true,
    );
  });

  it('keeps the supplied source dimensions as normalization inputs', () => {
    for (const asset of Object.values(RUNTIME_ASSETS)) {
      const source = readSourceAsset(asset);
      expect([source.width, source.height]).toEqual([
        asset.sourceWidth,
        asset.sourceHeight,
      ]);
    }
  });

  it('keeps terrain tiles opaque, 32 by 32, and edge-matched for repetition', () => {
    for (const asset of [RUNTIME_ASSETS.grass, RUNTIME_ASSETS.road]) {
      const image = readRuntimeAsset(asset);
      expect([asset.width, asset.height]).toEqual([32, 32]);
      expect([image.width, image.height]).toEqual([asset.width, asset.height]);
      expect(asset.opaque).toBe(true);
      expect(new Set(
        Array.from({ length: image.width * image.height }, (_, index) =>
          image.data[index * 4 + 3],
        ),
      )).toEqual(new Set([255]));

      for (let offset = 0; offset < image.height; offset += 1) {
        expect(getPixel(image, 0, offset)).toEqual(getPixel(image, image.width - 1, offset));
      }
      for (let offset = 0; offset < image.width; offset += 1) {
        expect(getPixel(image, offset, 0)).toEqual(getPixel(image, offset, image.height - 1));
      }
    }
  });

  it('keeps the player sheet at 128 by 192 with a 4 by 4 frame grid and no glow alpha', () => {
    const asset = RUNTIME_ASSETS.player;
    const image = readRuntimeAsset(asset);

    expect([asset.width, asset.height]).toEqual([128, 192]);
    expect([image.width, image.height]).toEqual([asset.width, asset.height]);
    expect([asset.frameWidth, asset.frameHeight]).toEqual([32, 48]);
    expect(image.width / asset.frameWidth).toBe(4);
    expect(image.height / asset.frameHeight).toBe(4);
    expect(asset.opaque).toBe(false);

    const alphaValues = new Set(
      Array.from({ length: image.width * image.height }, (_, index) =>
        image.data[index * 4 + 3],
      ),
    );
    expect(alphaValues).toEqual(new Set([0, 255]));
    expect(image.data.some((_, index) => index % 4 === 3 && image.data[index] === 0)).toBe(true);
    expect(image.data.some((_, index) => index % 4 === 3 && image.data[index] === 255)).toBe(true);
  });
});
