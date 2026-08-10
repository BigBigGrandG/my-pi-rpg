import { app, BrowserWindow, Menu } from 'electron';
import path from 'node:path';
import { GAME_HEIGHT, GAME_WIDTH } from './shared/game-config';

const createWindow = async (): Promise<BrowserWindow> => {
  const mainWindow = new BrowserWindow({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    minWidth: GAME_WIDTH,
    maxWidth: GAME_WIDTH,
    minHeight: GAME_HEIGHT,
    maxHeight: GAME_HEIGHT,
    useContentSize: true,
    resizable: false,
    title: 'My Pi RPG',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  return mainWindow;
};

const handleStartupError = (error: unknown): void => {
  console.error('Unable to start My Pi RPG:', error);
  app.quit();
};

const initialize = async (): Promise<void> => {
  await app.whenReady();
  app.setName('My Pi RPG');
  Menu.setApplicationMenu(null);
  await createWindow();
};

void initialize().catch(handleStartupError);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow().catch(handleStartupError);
  }
});
