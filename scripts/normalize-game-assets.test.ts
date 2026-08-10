import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import {
  normalizeNpcSprite,
  normalizePlayerSheet,
  normalizeTerrainTile,
  PLAYER_ALPHA_THRESHOLD,
} from './normalize-game-assets';

const projectRoot: string = resolve(import.meta.dirname, '..');

const readAsset = (relativePath: string): PNG =>
  PNG.sync.read(readFileSync(resolve(projectRoot, relativePath)));

describe('asset normalizer', () => {
  it('normalizes the supplied terrain and player sources in memory', () => {
    const grassTile = normalizeTerrainTile(
      readAsset('assets/game/terrain/grass-spring.png'),
    );
    const playerSheet = normalizePlayerSheet(
      readAsset('assets/game/characters/player-male.png'),
    );

    expect([grassTile.width, grassTile.height]).toEqual([32, 32]);
    expect([playerSheet.width, playerSheet.height]).toEqual([128, 192]);
    expect(PLAYER_ALPHA_THRESHOLD).toBe(240);
    expect(grassTile.data[3]).toBe(255);
    expect(grassTile.data[(31 * grassTile.width + 31) * 4 + 3]).toBe(255);
    expect(new Set(
      Array.from({ length: playerSheet.width * playerSheet.height }, (_, index) =>
        playerSheet.data[index * 4 + 3],
      ),
    )).toEqual(new Set([0, 255]));
  });

  it('matches opposite terrain edges for both-axis repetition', () => {
    const tile = normalizeTerrainTile(
      readAsset('assets/game/terrain/road-dirt.png'),
    );

    for (let offset = 0; offset < tile.height; offset += 1) {
      expect(tile.data[(offset * tile.width) * 4]).toBe(
        tile.data[(offset * tile.width + tile.width - 1) * 4],
      );
    }
    for (let offset = 0; offset < tile.width; offset += 1) {
      expect(tile.data[offset * 4]).toBe(
        tile.data[((tile.height - 1) * tile.width + offset) * 4],
      );
    }
  });

  it('rejects source dimensions outside the runtime normalizer contract', () => {
    expect(() => normalizeTerrainTile(new PNG({ width: 255, height: 256 }))).toThrow(
      'Terrain source must be at least 256 by 256 pixels.',
    );
    expect(() => normalizePlayerSheet(new PNG({ width: 128, height: 192 }))).toThrow(
      'Player source must be 1024 by 1536 pixels.',
    );
  });

  it('normalizes Leah to a transparent, bottom-centered 32 by 48 sprite', () => {
    const sprite = normalizeNpcSprite(
      readAsset('assets/game/characters/npc-leah.png'),
    );
    let minX = sprite.width;
    let maxX = -1;
    let minY = sprite.height;
    let maxY = -1;

    for (let y = 0; y < sprite.height; y += 1) {
      for (let x = 0; x < sprite.width; x += 1) {
        if (sprite.data[(y * sprite.width + x) * 4 + 3] !== 255) {
          continue;
        }

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }

    expect([sprite.width, sprite.height]).toEqual([32, 48]);
    expect(sprite.data[3]).toBe(0);
    expect(minX).toBeGreaterThan(0);
    expect(maxX).toBeLessThan(sprite.width - 1);
    expect(Math.abs((minX + maxX) / 2 - (sprite.width - 1) / 2)).toBeLessThanOrEqual(1);
    expect(minY).toBeGreaterThanOrEqual(0);
    expect(maxY).toBe(sprite.height - 1);
  });

  it('preserves transparent holes inside Leah’s trimmed artwork', () => {
    const source = new PNG({ width: 4, height: 4 });
    source.data.fill(255);
    for (let index = 0; index < source.width * source.height; index += 1) {
      source.data[index * 4] = 200;
      source.data[index * 4 + 1] = 120;
      source.data[index * 4 + 2] = 60;
    }
    source.data[(1 * source.width + 1) * 4 + 3] = 0;

    const sprite = normalizeNpcSprite(source);

    expect(sprite.data[(24 * sprite.width + 8) * 4 + 3]).toBe(0);
    expect(sprite.data[(24 * sprite.width + 16) * 4 + 3]).toBe(255);
  });
});
