import { AUTO, Core, Game, Input, Scene, Types } from 'phaser';
import './index.css';
import {
  advanceWorld,
  createWorldState,
  PLAYER_SPEED,
  type FacingDirection,
  type InputSnapshot,
  type WorldRules,
  type WorldState,
} from './domain/world-state';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_SIZE,
} from './shared/game-config';

const PLAY_FIELD_COLOR = '#143d2b';
const PLAYER_COLOR = 0x4285f4;
const MOVEMENT_BOUNDS = {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  playerSize: PLAYER_SIZE,
} as const;
const WORLD_RULES: WorldRules = {
  playerSpeed: PLAYER_SPEED,
  movementBounds: MOVEMENT_BOUNDS,
};

type Direction = FacingDirection;
type DirectionKey = { isDown: boolean };
type DirectionKeys = Record<Direction, DirectionKey>;
type PlayerView = { setPosition: (x: number, y: number) => void };

class PlayerScene extends Scene {
  private player: PlayerView | null = null;
  private worldState: WorldState = createWorldState({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
  });
  private cursorKeys: DirectionKeys | null = null;
  private wasdKeys: DirectionKeys | null = null;

  public constructor() {
    super('player-scene');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(PLAY_FIELD_COLOR);

    this.player = this.add
      .rectangle(
        this.worldState.player.position.x,
        this.worldState.player.position.y,
        PLAYER_SIZE,
        PLAYER_SIZE,
        PLAYER_COLOR,
      )
      .setOrigin(0.5);

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

    this.add.text(16, 16, 'Move: Arrow Keys / WASD', {
      color: '#ffffff',
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '16px',
    });
  }

  public update(_time: number, delta: number): void {
    if (!this.player) {
      return;
    }

    this.worldState = advanceWorld(
      this.worldState,
      this.readMovementInput(),
      delta / 1000,
      WORLD_RULES,
    );
    const { position } = this.worldState.player;
    this.player.setPosition(position.x, position.y);
  }

  private readMovementInput(): InputSnapshot {
    return {
      up: this.isDirectionDown('up'),
      down: this.isDirectionDown('down'),
      left: this.isDirectionDown('left'),
      right: this.isDirectionDown('right'),
    };
  }

  private isDirectionDown(direction: Direction): boolean {
    return Boolean(
      this.cursorKeys?.[direction]?.isDown || this.wasdKeys?.[direction]?.isDown,
    );
  }

  private handleBlur(): void {
    this.input.keyboard?.resetKeys();
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
  backgroundColor: PLAY_FIELD_COLOR,
  pixelArt: true,
  roundPixels: true,
  scene: [PlayerScene],
};

new Game(gameConfig);
