import { AUTO, Core, Game, Input, Scene, Types } from 'phaser';
import type { GameObjects } from 'phaser';
import './index.css';
import grassTileUrl from '../assets/game/runtime/grass-spring-tile.png';
import npcLeahUrl from '../assets/game/runtime/npc-leah.png';
import playerSheetUrl from '../assets/game/runtime/player-male-sheet.png';
import roadTileUrl from '../assets/game/runtime/road-dirt-tile.png';
import { getDialogueDefinition } from './domain/dialogue';
import {
  BUILDING_IDS,
  ENVIRONMENT_ASSET_IDS,
} from './domain/village-layout';
import {
  advanceWorld,
  createWorldState,
  type FacingDirection,
  type InputSnapshot,
  type WorldState,
} from './domain/world-state';
import { LEAH, ROAD_MAP, ROAD_WORLD_RULES } from './domain/road-map';
import {
  createInputHistory,
  recordInput,
  type DirectionalInput,
  type InputHistory,
} from './game/input-history';
import {
  createInteractionInputState,
  recordInteractionInput,
} from './game/interaction-input';
import { createDialoguePanel } from './game/dialogue-panel';
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
import {
  getLeahPromptPosition,
  getNpcShadowPosition,
  getNpcSpritePosition,
  NPC_SHADOW_HEIGHT,
  NPC_SHADOW_WIDTH,
  shouldShowLeahPrompt,
} from './game/npc-presentation';
import {
  RUNTIME_ASSETS,
  RUNTIME_DECORATION_ASSETS,
} from './game/runtime-assets';
import { RUNTIME_DECORATION_URLS } from './game/runtime-decoration-urls';
import { getVillageRenderItems } from './game/village-presentation';
import { GAME_HEIGHT, GAME_WIDTH } from './shared/game-config';

const GRASS_COLOR = 0x70c52b;
const GRASS_TEXTURE_KEY = RUNTIME_ASSETS.grass.id;
const ROAD_TEXTURE_KEY = RUNTIME_ASSETS.road.id;
const PLAYER_TEXTURE_KEY = RUNTIME_ASSETS.player.id;
const NPC_LEAH_TEXTURE_KEY = RUNTIME_ASSETS.leah.id;
const PLAYER_SHADOW_COLOR = 0x10200f;
const PLAYER_SHADOW_ALPHA = 0.35;
const NPC_SHADOW_COLOR = 0x10200f;
const NPC_SHADOW_ALPHA = 0.35;

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

type NpcPromptView = {
  setPosition: (x: number, y: number) => void;
  setVisible: (visible: boolean) => void;
};

class PlayerScene extends Scene {
  private player: PlayerView | null = null;
  private playerShadow: PlayerShadowView | null = null;
  private leah: PlayerView | null = null;
  private leahShadow: PlayerShadowView | null = null;
  private leahPromptBackground: NpcPromptView | null = null;
  private leahPrompt: NpcPromptView | null = null;
  private dialoguePanel: GameObjects.Container | null = null;
  private renderedDialogueNpcId: string | null = null;
  private worldState: WorldState = createWorldState(ROAD_MAP.playerSpawn);
  private cursorKeys: DirectionKeys | null = null;
  private wasdKeys: DirectionKeys | null = null;
  private interactionKey: DirectionKey | null = null;
  private inputHistory: InputHistory = createInputHistory();
  private interactionInput = createInteractionInputState();
  private playerPresentation = createPlayerPresentationState();

  public constructor() {
    super('player-scene');
  }

  public preload(): void {
    this.load.image(GRASS_TEXTURE_KEY, grassTileUrl);
    this.load.image(ROAD_TEXTURE_KEY, roadTileUrl);
    this.load.image(NPC_LEAH_TEXTURE_KEY, npcLeahUrl);
    this.load.spritesheet(PLAYER_TEXTURE_KEY, playerSheetUrl, {
      frameWidth: RUNTIME_ASSETS.player.frameWidth,
      frameHeight: RUNTIME_ASSETS.player.frameHeight,
    });

    for (const assetId of BUILDING_IDS) {
      const asset = RUNTIME_DECORATION_ASSETS.buildings[assetId];
      this.load.image(asset.id, RUNTIME_DECORATION_URLS.buildings[assetId]);
    }
    for (const assetId of ENVIRONMENT_ASSET_IDS) {
      const asset = RUNTIME_DECORATION_ASSETS.environment[assetId];
      this.load.image(asset.id, RUNTIME_DECORATION_URLS.environment[assetId]);
    }
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(GRASS_COLOR);
    this.drawMap();

    const initialLeahShadowPosition = getNpcShadowPosition(LEAH.position);
    this.leahShadow = this.add
      .ellipse(
        initialLeahShadowPosition.x,
        initialLeahShadowPosition.y,
        NPC_SHADOW_WIDTH,
        NPC_SHADOW_HEIGHT,
        NPC_SHADOW_COLOR,
        NPC_SHADOW_ALPHA,
      )
      .setDepth(2);

    const initialLeahSpritePosition = getNpcSpritePosition(LEAH.position);
    this.leah = this.add
      .sprite(
        initialLeahSpritePosition.x,
        initialLeahSpritePosition.y,
        NPC_LEAH_TEXTURE_KEY,
      )
      .setOrigin(0.5)
      .setDepth(3);

    const initialLeahPromptPosition = getLeahPromptPosition(LEAH.position);
    this.leahPromptBackground = this.add
      .rectangle(
        initialLeahPromptPosition.x,
        initialLeahPromptPosition.y,
        28,
        26,
        0x26331d,
        0.9,
      )
      .setStrokeStyle(2, 0xffffff, 1)
      .setDepth(4)
      .setVisible(false);

    this.leahPrompt = this.add
      .text(initialLeahPromptPosition.x, initialLeahPromptPosition.y, 'J', {
        color: '#ffffff',
        fontFamily: 'Segoe UI, Microsoft YaHei, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(5)
      .setVisible(false);

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
      .setDepth(3);

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
      this.interactionKey = keyboard.addKey(Input.Keyboard.KeyCodes.J);
    }

    this.game.events.on(Core.Events.BLUR, this.handleBlur, this);
    this.events.once(Core.Events.DESTROY, this.handleDestroy, this);

    this.add
      .text(16, 16, 'Move: Arrow Keys / WASD | Face Leah and press J', {
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

    const input = this.readMovementInput();
    const interactionPressed = this.readInteractionPressed();
    this.worldState = advanceWorld(
      this.worldState,
      { ...input, interactionPressed },
      delta / 1000,
      ROAD_WORLD_RULES,
    );
    this.updatePlayerPresentation(delta);
    this.updateLeahPresentation();
    this.updateDialoguePresentation();
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

    for (const item of getVillageRenderItems()) {
      this.add
        .image(
          item.position.x,
          item.position.y,
          item.textureKey,
        )
        .setOrigin(item.origin.x, item.origin.y)
        .setDepth(item.depth);
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

  private updateLeahPresentation(): void {
    if (
      !this.leah ||
      !this.leahShadow ||
      !this.leahPromptBackground ||
      !this.leahPrompt
    ) {
      return;
    }

    const spritePosition = getNpcSpritePosition(LEAH.position);
    const shadowPosition = getNpcShadowPosition(LEAH.position);
    const promptPosition = getLeahPromptPosition(LEAH.position);
    const showPrompt = shouldShowLeahPrompt(this.worldState);
    this.leah.setPosition(spritePosition.x, spritePosition.y);
    this.leahShadow.setPosition(shadowPosition.x, shadowPosition.y);
    this.leahPromptBackground.setPosition(promptPosition.x, promptPosition.y);
    this.leahPrompt.setPosition(promptPosition.x, promptPosition.y);
    this.leahPromptBackground.setVisible(showPrompt);
    this.leahPrompt.setVisible(showPrompt);
  }

  private updateDialoguePresentation(): void {
    const npcId = this.worldState.dialogue.npcId;
    if (npcId === null) {
      this.dialoguePanel?.setVisible(false);
      return;
    }

    const dialogue = getDialogueDefinition(npcId);
    if (dialogue === null) {
      this.dialoguePanel?.setVisible(false);
      return;
    }

    if (this.renderedDialogueNpcId !== npcId) {
      this.dialoguePanel?.destroy(true);
      this.dialoguePanel = createDialoguePanel(
        this,
        dialogue,
        GAME_WIDTH,
        GAME_HEIGHT,
      );
      this.renderedDialogueNpcId = dialogue.npcId;
    }
    this.dialoguePanel?.setVisible(true);
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

  private readInteractionPressed(): boolean {
    const result = recordInteractionInput(
      this.interactionInput,
      Boolean(this.interactionKey?.isDown),
    );
    this.interactionInput = result.state;
    return result.pressed;
  }

  private isDirectionDown(direction: Direction): boolean {
    return Boolean(
      this.cursorKeys?.[direction]?.isDown || this.wasdKeys?.[direction]?.isDown,
    );
  }

  private handleBlur(): void {
    this.input.keyboard?.resetKeys();
    this.inputHistory = createInputHistory();
    this.interactionInput = createInteractionInputState();
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
