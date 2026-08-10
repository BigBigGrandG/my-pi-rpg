import { AUTO, Core, Game, Input, Scene, Types } from 'phaser';
import './index.css';
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
import { GAME_HEIGHT, GAME_WIDTH, PLAYER_SIZE } from './shared/game-config';

const GRASS_COLOR = 0x79aa5c;
const ROAD_COLOR = 0xb98655;
const ROAD_EDGE_COLOR = 0x9d6d45;
const PLAYER_COLOR = 0x4285f4;

type Direction = FacingDirection;
type DirectionKey = { isDown: boolean };
type DirectionKeys = Record<Direction, DirectionKey>;
type PlayerView = {
  readonly x: number;
  readonly y: number;
  setPosition: (x: number, y: number) => void;
};

class PlayerScene extends Scene {
  private player: PlayerView | null = null;
  private worldState: WorldState = createWorldState(ROAD_MAP.playerSpawn);
  private cursorKeys: DirectionKeys | null = null;
  private wasdKeys: DirectionKeys | null = null;
  private inputHistory: InputHistory = createInputHistory();

  public constructor() {
    super('player-scene');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(GRASS_COLOR);
    this.drawMap();

    this.player = this.add
      .rectangle(
        this.worldState.player.position.x,
        this.worldState.player.position.y,
        PLAYER_SIZE,
        PLAYER_SIZE,
        PLAYER_COLOR,
      )
      .setOrigin(0.5);

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
      .setScrollFactor(0);
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
    const { position } = this.worldState.player;
    this.player.setPosition(position.x, position.y);
  }

  private drawMap(): void {
    const map = this.add.graphics();
    map.fillStyle(GRASS_COLOR, 1);
    map.fillRect(0, 0, ROAD_MAP.worldWidth, ROAD_MAP.worldHeight);
    map.fillStyle(ROAD_COLOR, 1);

    const roadRectangles = getRoadRectangles(ROAD_MAP);
    for (const rectangle of roadRectangles) {
      map.fillRect(
        rectangle.x,
        rectangle.y,
        rectangle.width,
        rectangle.height,
      );
    }

    map.lineStyle(2, ROAD_EDGE_COLOR, 0.8);
    for (const rectangle of roadRectangles) {
      map.strokeRect(
        rectangle.x,
        rectangle.y,
        rectangle.width,
        rectangle.height,
      );
    }
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
