import type {
  BuildingId,
  EnvironmentAssetId,
} from '../domain/village-layout';

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

export interface RuntimeDecorationAssetContract extends RuntimeAssetContract {
  readonly anchor: {
    readonly x: number;
    readonly y: number;
  };
}

export interface RuntimeAssetManifest {
  readonly grass: RuntimeAssetContract;
  readonly road: RuntimeAssetContract;
  readonly player: RuntimePlayerAssetContract;
  readonly leah: RuntimeAssetContract;
}

export interface RuntimeDecorationAssetManifest {
  readonly buildings: Readonly<Record<BuildingId, RuntimeDecorationAssetContract>>;
  readonly environment: Readonly<Record<EnvironmentAssetId, RuntimeDecorationAssetContract>>;
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

const BOTTOM_CENTER_ANCHOR = { x: 0.5, y: 1 } as const;

export const RUNTIME_DECORATION_ASSETS: Readonly<RuntimeDecorationAssetManifest> = {
  buildings: {
    'player-house': {
      id: 'player-house',
      sourcePath: 'assets/game/buildings/player-house.png',
      path: 'assets/game/runtime/buildings/player-house.png',
      sourceWidth: 1536,
      sourceHeight: 1024,
      width: 192,
      height: 160,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
    'general-store': {
      id: 'general-store',
      sourcePath: 'assets/game/buildings/general-store.png',
      path: 'assets/game/runtime/buildings/general-store.png',
      sourceWidth: 1254,
      sourceHeight: 1254,
      width: 192,
      height: 160,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
    clinic: {
      id: 'clinic',
      sourcePath: 'assets/game/buildings/clinic.png',
      path: 'assets/game/runtime/buildings/clinic.png',
      sourceWidth: 1254,
      sourceHeight: 1254,
      width: 192,
      height: 160,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
    blacksmith: {
      id: 'blacksmith',
      sourcePath: 'assets/game/buildings/blacksmith.png',
      path: 'assets/game/runtime/buildings/blacksmith.png',
      sourceWidth: 1536,
      sourceHeight: 1024,
      width: 192,
      height: 160,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
    inn: {
      id: 'inn',
      sourcePath: 'assets/game/buildings/inn.png',
      path: 'assets/game/runtime/buildings/inn.png',
      sourceWidth: 1254,
      sourceHeight: 1254,
      width: 192,
      height: 160,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
    'ranch-store': {
      id: 'ranch-store',
      sourcePath: 'assets/game/buildings/ranch-store.png',
      path: 'assets/game/runtime/buildings/ranch-store.png',
      sourceWidth: 1254,
      sourceHeight: 1254,
      width: 192,
      height: 160,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
  },
  environment: {
    'tree-spring': {
      id: 'tree-spring',
      sourcePath: 'assets/game/environment/tree-spring.png',
      path: 'assets/game/runtime/environment/tree-spring.png',
      sourceWidth: 1024,
      sourceHeight: 1536,
      width: 64,
      height: 96,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
    'bush-spring': {
      id: 'bush-spring',
      sourcePath: 'assets/game/environment/bush-spring.png',
      path: 'assets/game/runtime/environment/bush-spring.png',
      sourceWidth: 1536,
      sourceHeight: 1024,
      width: 32,
      height: 32,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
    'pond-spring': {
      id: 'pond-spring',
      sourcePath: 'assets/game/environment/pond-spring.png',
      path: 'assets/game/runtime/environment/pond-spring.png',
      sourceWidth: 1536,
      sourceHeight: 1024,
      width: 192,
      height: 128,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
    'fence-horizontal': {
      id: 'fence-horizontal',
      sourcePath: 'assets/game/environment/fence-horizontal.png',
      path: 'assets/game/runtime/environment/fence-horizontal.png',
      sourceWidth: 1536,
      sourceHeight: 1024,
      width: 32,
      height: 32,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
    'fence-vertical': {
      id: 'fence-vertical',
      sourcePath: 'assets/game/environment/fence-vertical.png',
      path: 'assets/game/runtime/environment/fence-vertical.png',
      sourceWidth: 1024,
      sourceHeight: 1536,
      width: 32,
      height: 32,
      opaque: false,
      anchor: BOTTOM_CENTER_ANCHOR,
    },
  },
};
