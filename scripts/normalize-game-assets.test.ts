import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import {
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
});
