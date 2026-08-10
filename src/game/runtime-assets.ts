export interface RuntimeAssetContract {
  readonly id: string;
  readonly sourcePath: string;
  readonly path: string;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly width: number;
  readonly height: number;
  readonly opaque: boolean;
  readonly frameWidth?: number;
  readonly frameHeight?: number;
}

export interface RuntimePlayerAssetContract extends RuntimeAssetContract {
  readonly frameWidth: number;
  readonly frameHeight: number;
}

export interface RuntimeAssetManifest {
  readonly grass: RuntimeAssetContract;
  readonly road: RuntimeAssetContract;
  readonly player: RuntimePlayerAssetContract;
  readonly leah: RuntimeAssetContract;
}

export const RUNTIME_ASSET_IDS = [
  'grass-spring',
  'road-dirt',
  'player-male',
  'npc-leah',
] as const;

export type RuntimeAssetId = (typeof RUNTIME_ASSET_IDS)[number];

export const RUNTIME_ASSETS: Readonly<RuntimeAssetManifest> = {
  grass: {
    id: 'grass-spring',
    sourcePath: 'assets/game/terrain/grass-spring.png',
    path: 'assets/game/runtime/grass-spring-tile.png',
    sourceWidth: 1254,
    sourceHeight: 1254,
    width: 32,
    height: 32,
    opaque: true,
  },
  road: {
    id: 'road-dirt',
    sourcePath: 'assets/game/terrain/road-dirt.png',
    path: 'assets/game/runtime/road-dirt-tile.png',
    sourceWidth: 1254,
    sourceHeight: 1254,
    width: 32,
    height: 32,
    opaque: true,
  },
  player: {
    id: 'player-male',
    sourcePath: 'assets/game/characters/player-male.png',
    path: 'assets/game/runtime/player-male-sheet.png',
    sourceWidth: 1024,
    sourceHeight: 1536,
    width: 128,
    height: 192,
    opaque: false,
    frameWidth: 32,
    frameHeight: 48,
  },
  leah: {
    id: 'npc-leah',
    sourcePath: 'assets/game/characters/npc-leah.png',
    path: 'assets/game/runtime/npc-leah.png',
    sourceWidth: 1254,
    sourceHeight: 1254,
    width: 32,
    height: 48,
    opaque: false,
  },
};
