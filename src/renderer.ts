import { AUTO, Game, Scene, Types } from 'phaser';
import './index.css';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_SIZE,
} from './shared/game-config';

const PLAY_FIELD_COLOR = '#143d2b';
const PLAYER_COLOR = 0x4285f4;

class StaticScene extends Scene {
  public constructor() {
    super('static-scene');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(PLAY_FIELD_COLOR);

    this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        PLAYER_SIZE,
        PLAYER_SIZE,
        PLAYER_COLOR,
      )
      .setOrigin(0.5);

    this.add.text(16, 16, 'Move: Arrow Keys / WASD', {
      color: '#ffffff',
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '16px',
    });
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
  scene: [StaticScene],
};

new Game(gameConfig);
