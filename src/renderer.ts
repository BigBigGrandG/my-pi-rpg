import { AUTO, Core, Game, Input, Scene, Types } from 'phaser';
import './index.css';
import grassTileUrl from '../assets/game/runtime/grass-spring-tile.png';
import playerSheetUrl from '../assets/game/runtime/player-male-sheet.png';
import roadTileUrl from '../assets/game/runtime/road-dirt-tile.png';
import {
  advanceWorld,
  createWorldState,
  type FacingDirection,
  type InputSnapshot,
  type WorldState,
} from './domain/world-state';
import { ROAD_MAP, ROAD_WORLD_RULES } from './domain/road-map';
import {
  createInputHistory,
  recordInput,
  type DirectionalInput,
  type InputHistory,
} from './game/input-history';
import {
  getRoadRectangles,
  ROAD_CAMERA_SETTINGS,
} from './game/road-map-presentation';
import {
  advancePlayerPresentation,
  createPlayerPresentationState,
  getPlayerPresentationFrame,
  getPlayerShadowPosition,
  getPlayerSpritePosition,
  PLAYER_SHADOW_HEIGHT,
  PLAYER_SHADOW_WIDTH,
} from './game/player-presentation';
import { RUNTIME_ASSETS } from './game/runtime-assets';
import { GAME_HEIGHT, GAME_WIDTH } from './shared/game-config';

const GRASS_COLOR = 0x70c52b;
const GRASS_TEXTURE_KEY = RUNTIME_ASSETS.grass.id;
const ROAD_TEXTURE_KEY = RUNTIME_ASSETS.road.id;
const PLAYER_TEXTURE_KEY = RUNTIME_ASSETS.player.id;
const PLAYER_SHADOW_COLOR = 0x10200f;
const PLAYER_SHADOW_ALPHA = 0.35;

type Direction = FacingDirection;
type DirectionKey = { isDown: boolean };
type DirectionKeys = Record<Direction, DirectionKey>;
type PlayerView = {
  readonly x: number;
  readonly y: number;
  setPosition: (x: number, y: number) => void;
  setFrame: (frame: number) => void;
};

type PlayerShadowView = {
  setPosition: (x: number, y: number) => void;
};

class PlayerScene extends Scene {
  private player: PlayerView | null = null;
  private playerShadow: PlayerShadowView | null = null;
  private worldState: WorldState = createWorldState(ROAD_MAP.playerSpawn);
  private cursorKeys: DirectionKeys | null = null;
  private wasdKeys: DirectionKeys | null = null;
  private inputHistory: InputHistory = createInputHistory();
  private playerPresentation = createPlayerPresentationState();

  public constructor() {
    super('player-scene');
  }

  public preload(): void {
    this.load.image(GRASS_TEXTURE_KEY, grassTileUrl);
    this.load.image(ROAD_TEXTURE_KEY, roadTileUrl);
    this.load.spritesheet(PLAYER_TEXTURE_KEY, playerSheetUrl, {
      frameWidth: RUNTIME_ASSETS.player.frameWidth,
      frameHeight: RUNTIME_ASSETS.player.frameHeight,
    });
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(GRASS_COLOR);
    this.drawMap();

    const initialPosition = this.worldState.player.position;
    const initialSpritePosition = getPlayerSpritePosition(initialPosition);
    const initialShadowPosition = getPlayerShadowPosition(initialPosition);
    this.playerShadow = this.add
      .ellipse(
        initialShadowPosition.x,
        initialShadowPosition.y,
        PLAYER_SHADOW_WIDTH,
        PLAYER_SHADOW_HEIGHT,
        PLAYER_SHADOW_COLOR,
        PLAYER_SHADOW_ALPHA,
      )
      .setDepth(1);

    this.player = this.add
      .sprite(
        initialSpritePosition.x,
        initialSpritePosition.y,
        PLAYER_TEXTURE_KEY,
        0,
      )
      .setOrigin(0.5)
      .setDepth(2);

    this.cameras.main.setBounds(
      0,
      0,
      ROAD_MAP.worldWidth,
      ROAD_MAP.worldHeight,
    );
    this.cameras.main.setZoom(ROAD_CAMERA_SETTINGS.zoom);
    this.cameras.main.startFollow(
      this.player,
      true,
      ROAD_CAMERA_SETTINGS.lerpX,
      ROAD_CAMERA_SETTINGS.lerpY,
    );

    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.cursorKeys = keyboard.createCursorKeys();
      this.wasdKeys = keyboard.addKeys({
        up: Input.Keyboard.KeyCodes.W,
        down: Input.Keyboard.KeyCodes.S,
        left: Input.Keyboard.KeyCodes.A,
        right: Input.Keyboard.KeyCodes.D,
      }) as DirectionKeys;
    }

    this.game.events.on(Core.Events.BLUR, this.handleBlur, this);
    this.events.once(Core.Events.DESTROY, this.handleDestroy, this);

    this.add
      .text(16, 16, 'Move: Arrow Keys / WASD | Roads only', {
        color: '#ffffff',
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '16px',
      })
      .setScrollFactor(0)
      .setDepth(10);
  }

  public update(_time: number, delta: number): void {
    if (!this.player) {
      return;
    }

    this.worldState = advanceWorld(
      this.worldState,
      this.readMovementInput(),
      delta / 1000,
      ROAD_WORLD_RULES,
    );
    this.updatePlayerPresentation(delta);
  }

  private drawMap(): void {
    this.add
      .tileSprite(
        0,
        0,
        ROAD_MAP.worldWidth,
        ROAD_MAP.worldHeight,
        GRASS_TEXTURE_KEY,
      )
      .setOrigin(0)
      .setDepth(0);

    const roadRectangles = getRoadRectangles(ROAD_MAP);
    for (const rectangle of roadRectangles) {
      this.add
        .tileSprite(
          rectangle.x,
          rectangle.y,
          rectangle.width,
          rectangle.height,
          ROAD_TEXTURE_KEY,
        )
        .setOrigin(0)
        .setDepth(1);
    }
  }

  private updatePlayerPresentation(delta: number): void {
    if (!this.player || !this.playerShadow) {
      return;
    }

    const { facing, isMoving } = this.worldState.player;
    this.playerPresentation = advancePlayerPresentation(
      this.playerPresentation,
      { facing, isMoving },
      delta,
    );
    this.player.setFrame(
      getPlayerPresentationFrame(this.playerPresentation),
    );

    const { position } = this.worldState.player;
    const spritePosition = getPlayerSpritePosition(position);
    const shadowPosition = getPlayerShadowPosition(position);
    this.player.setPosition(spritePosition.x, spritePosition.y);
    this.playerShadow.setPosition(shadowPosition.x, shadowPosition.y);
  }

  private readMovementInput(): InputSnapshot {
    const input: DirectionalInput = {
      up: this.isDirectionDown('up'),
      down: this.isDirectionDown('down'),
      left: this.isDirectionDown('left'),
      right: this.isDirectionDown('right'),
    };

    this.inputHistory = recordInput(this.inputHistory, input);
    return {
      ...input,
      lastPressedDirection: this.inputHistory.lastPressedDirection,
    };
  }

  private isDirectionDown(direction: Direction): boolean {
    return Boolean(
      this.cursorKeys?.[direction]?.isDown || this.wasdKeys?.[direction]?.isDown,
    );
  }

  private handleBlur(): void {
    this.input.keyboard?.resetKeys();
    this.inputHistory = createInputHistory();
  }

  private handleDestroy(): void {
    this.game.events.off(Core.Events.BLUR, this.handleBlur, this);
  }
}

const gameConfig: Types.Core.GameConfig = {
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game',
  backgroundColor: GRASS_COLOR,
  pixelArt: true,
  roundPixels: true,
  scene: [PlayerScene],
};

new Game(gameConfig);
