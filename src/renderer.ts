import { AUTO, Core, Game, Input, Scene, Types } from 'phaser';
import './index.css';
import {
  advancePlayer,
  type MovementInput,
  type PlayerPosition,
} from './domain/player-movement';
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

type Direction = 'up' | 'down' | 'left' | 'right';
type DirectionKey = { isDown: boolean };
type DirectionKeys = Record<Direction, DirectionKey>;
type PlayerView = { setPosition: (x: number, y: number) => void };

class PlayerScene extends Scene {
  private player: PlayerView | null = null;
  private playerPosition: PlayerPosition = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
  };
  private cursorKeys: DirectionKeys | null = null;
  private wasdKeys: DirectionKeys | null = null;

  public constructor() {
    super('player-scene');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(PLAY_FIELD_COLOR);

    this.player = this.add
      .rectangle(
        this.playerPosition.x,
        this.playerPosition.y,
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

    this.playerPosition = advancePlayer(
      this.playerPosition,
      this.readMovementInput(),
      delta / 1000,
      MOVEMENT_BOUNDS,
    );
    this.player.setPosition(this.playerPosition.x, this.playerPosition.y);
  }

  private readMovementInput(): MovementInput {
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
