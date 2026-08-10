import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { RUNTIME_ASSETS } from '../src/game/runtime-assets.ts';

type RgbColor = [number, number, number];
type PngImage = PNG;

const projectRoot: string = resolve(import.meta.dirname, '..');
const terrainTileSize = RUNTIME_ASSETS.grass.width;
const terrainCropSize = 256;
const playerColumns = RUNTIME_ASSETS.player.width / RUNTIME_ASSETS.player.frameWidth;
const playerRows = RUNTIME_ASSETS.player.height / RUNTIME_ASSETS.player.frameHeight;
const playerSourceFrameWidth = RUNTIME_ASSETS.player.sourceWidth / playerColumns;
const playerSourceFrameHeight = RUNTIME_ASSETS.player.sourceHeight / playerRows;
const playerFrameWidth = RUNTIME_ASSETS.player.frameWidth;
const playerFrameHeight = RUNTIME_ASSETS.player.frameHeight;
const npcSpriteWidth = RUNTIME_ASSETS.leah.width;
const npcSpriteHeight = RUNTIME_ASSETS.leah.height;
export const PLAYER_ALPHA_THRESHOLD = 240;

const readPng = (relativePath: string): PngImage =>
  PNG.sync.read(readFileSync(resolve(projectRoot, relativePath)));

const writePng = (relativePath: string, image: PngImage): void => {
  const outputPath = resolve(projectRoot, relativePath);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, PNG.sync.write(image));
};

const copyPixel = (
  source: PngImage,
  sourceX: number,
  sourceY: number,
  target: PngImage,
  targetX: number,
  targetY: number,
): void => {
  const sourceOffset = (sourceY * source.width + sourceX) * 4;
  const targetOffset = (targetY * target.width + targetX) * 4;
  target.data[targetOffset] = source.data[sourceOffset];
  target.data[targetOffset + 1] = source.data[sourceOffset + 1];
  target.data[targetOffset + 2] = source.data[sourceOffset + 2];
  target.data[targetOffset + 3] = 255;
};

const averageSourceBlock = (
  source: PngImage,
  startX: number,
  startY: number,
  blockWidth: number,
  blockHeight: number,
): RgbColor => {
  const totals: RgbColor = [0, 0, 0];
  let sampleCount = 0;

  for (let y = startY; y < startY + blockHeight; y += 1) {
    for (let x = startX; x < startX + blockWidth; x += 1) {
      const offset = (y * source.width + x) * 4;
      totals[0] += source.data[offset];
      totals[1] += source.data[offset + 1];
      totals[2] += source.data[offset + 2];
      sampleCount += 1;
    }
  }

  return [
    Math.round(totals[0] / sampleCount),
    Math.round(totals[1] / sampleCount),
    Math.round(totals[2] / sampleCount),
  ];
};

export const normalizeTerrainTile = (source: PngImage): PngImage => {
  if (source.width < terrainCropSize || source.height < terrainCropSize) {
    throw new Error('Terrain source must be at least 256 by 256 pixels.');
  }

  const cropStartX = Math.floor((source.width - terrainCropSize) / 2);
  const cropStartY = Math.floor((source.height - terrainCropSize) / 2);
  const tile = new PNG({ width: terrainTileSize, height: terrainTileSize });
  const sourceBlockSize = terrainCropSize / terrainTileSize;

  for (let y = 0; y < terrainTileSize; y += 1) {
    for (let x = 0; x < terrainTileSize; x += 1) {
      const color = averageSourceBlock(
        source,
        cropStartX + x * sourceBlockSize,
        cropStartY + y * sourceBlockSize,
        sourceBlockSize,
        sourceBlockSize,
      );
      const offset = (y * tile.width + x) * 4;
      tile.data[offset] = color[0];
      tile.data[offset + 1] = color[1];
      tile.data[offset + 2] = color[2];
      tile.data[offset + 3] = 255;
    }
  }

  for (let offset = 0; offset < tile.height; offset += 1) {
    copyPixel(tile, 0, offset, tile, tile.width - 1, offset);
  }
  for (let offset = 0; offset < tile.width; offset += 1) {
    copyPixel(tile, offset, 0, tile, offset, tile.height - 1);
  }

  return tile;
};

const averageOpaqueSourceBlock = (
  source: PngImage,
  startX: number,
  startY: number,
  blockWidth: number,
  blockHeight: number,
): { readonly color: RgbColor; readonly isOpaque: boolean } => {
  const totals: RgbColor = [0, 0, 0];
  let sampleCount = 0;

  for (let y = startY; y < startY + blockHeight; y += 1) {
    for (let x = startX; x < startX + blockWidth; x += 1) {
      const offset = (y * source.width + x) * 4;
      if (source.data[offset + 3] < PLAYER_ALPHA_THRESHOLD) {
        continue;
      }

      totals[0] += source.data[offset];
      totals[1] += source.data[offset + 1];
      totals[2] += source.data[offset + 2];
      sampleCount += 1;
    }
  }

  return {
    color: sampleCount === 0
      ? [0, 0, 0]
      : [
          Math.round(totals[0] / sampleCount),
          Math.round(totals[1] / sampleCount),
          Math.round(totals[2] / sampleCount),
        ],
    isOpaque: sampleCount > 0,
  };
};

export const normalizePlayerSheet = (source: PngImage): PngImage => {
  const expectedWidth = playerColumns * playerSourceFrameWidth;
  const expectedHeight = playerRows * playerSourceFrameHeight;
  if (source.width !== expectedWidth || source.height !== expectedHeight) {
    throw new Error(
      `Player source must be ${expectedWidth} by ${expectedHeight} pixels.`,
    );
  }

  const sheet = new PNG({
    width: playerColumns * playerFrameWidth,
    height: playerRows * playerFrameHeight,
  });
  const sourceBlockWidth = playerSourceFrameWidth / playerFrameWidth;
  const sourceBlockHeight = playerSourceFrameHeight / playerFrameHeight;

  for (let row = 0; row < playerRows; row += 1) {
    for (let column = 0; column < playerColumns; column += 1) {
      for (let y = 0; y < playerFrameHeight; y += 1) {
        for (let x = 0; x < playerFrameWidth; x += 1) {
          const sample = averageOpaqueSourceBlock(
            source,
            column * playerSourceFrameWidth + x * sourceBlockWidth,
            row * playerSourceFrameHeight + y * sourceBlockHeight,
            sourceBlockWidth,
            sourceBlockHeight,
          );
          const targetX = column * playerFrameWidth + x;
          const targetY = row * playerFrameHeight + y;
          const targetOffset = (targetY * sheet.width + targetX) * 4;
          sheet.data[targetOffset] = sample.color[0];
          sheet.data[targetOffset + 1] = sample.color[1];
          sheet.data[targetOffset + 2] = sample.color[2];
          sheet.data[targetOffset + 3] = sample.isOpaque ? 255 : 0;
        }
      }
    }
  }

  return sheet;
};

interface PixelBounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

const findOpaqueBounds = (source: PngImage): PixelBounds => {
  let left = source.width;
  let top = source.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const alpha = source.data[(y * source.width + x) * 4 + 3];
      if (alpha < PLAYER_ALPHA_THRESHOLD) {
        continue;
      }

      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) {
    throw new Error('NPC source must contain opaque artwork.');
  }

  return { left, top, right, bottom };
};

export const normalizeNpcSprite = (source: PngImage): PngImage => {
  const bounds = findOpaqueBounds(source);
  const sourceWidth = bounds.right - bounds.left + 1;
  const sourceHeight = bounds.bottom - bounds.top + 1;
  const scale = Math.min(
    npcSpriteWidth / sourceWidth,
    npcSpriteHeight / sourceHeight,
  );
  const scaledWidth = Math.max(1, Math.round(sourceWidth * scale));
  const scaledHeight = Math.max(1, Math.round(sourceHeight * scale));
  const target = new PNG({ width: npcSpriteWidth, height: npcSpriteHeight });
  const offsetX = Math.floor((npcSpriteWidth - scaledWidth) / 2);
  const offsetY = npcSpriteHeight - scaledHeight;

  for (let y = 0; y < scaledHeight; y += 1) {
    for (let x = 0; x < scaledWidth; x += 1) {
      const sourceX = bounds.left + Math.min(
        sourceWidth - 1,
        Math.floor((x * sourceWidth) / scaledWidth),
      );
      const sourceY = bounds.top + Math.min(
        sourceHeight - 1,
        Math.floor((y * sourceHeight) / scaledHeight),
      );
      const sourceOffset = (sourceY * source.width + sourceX) * 4;
      if (source.data[sourceOffset + 3] < PLAYER_ALPHA_THRESHOLD) {
        continue;
      }
      const targetOffset = ((offsetY + y) * target.width + offsetX + x) * 4;

      target.data[targetOffset] = source.data[sourceOffset];
      target.data[targetOffset + 1] = source.data[sourceOffset + 1];
      target.data[targetOffset + 2] = source.data[sourceOffset + 2];
      target.data[targetOffset + 3] = 255;
    }
  }

  return target;
};

export const normalizeGameAssets = (): void => {
  const grassSource = readPng('assets/game/terrain/grass-spring.png');
  const roadSource = readPng('assets/game/terrain/road-dirt.png');
  const playerSource = readPng('assets/game/characters/player-male.png');
  const leahSource = readPng('assets/game/characters/npc-leah.png');

  writePng(
    'assets/game/runtime/grass-spring-tile.png',
    normalizeTerrainTile(grassSource),
  );
  writePng(
    'assets/game/runtime/road-dirt-tile.png',
    normalizeTerrainTile(roadSource),
  );
  writePng(
    'assets/game/runtime/player-male-sheet.png',
    normalizePlayerSheet(playerSource),
  );
  writePng(
    'assets/game/runtime/npc-leah.png',
    normalizeNpcSprite(leahSource),
  );
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  normalizeGameAssets();
}
