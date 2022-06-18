import {app, BrowserWindow, Tray} from "electron";
import electronDebug from "electron-debug";
import * as path from "path";
import sourceMapSupport from "source-map-support";
import {APP_NAME, MAIN_WINDOW_DEFAULT_HEIGHT, MAIN_WINDOW_DEFAULT_WIDTH} from "../constants";
import {activateFrequentPolling, refreshPersistentCredentials} from "./handlers/spotify";
import {launchTray} from "./handlers/tray";
import {launchMainWindow} from "./handlers/window";
import {authenticateInBrowser, handleProtocolCalls} from "./services/auth";

/**
 * The main window, if it is being rendered.
 */
let mainWindow: BrowserWindow | null = null;

/**
 * The macOS tray icon in the status bar, if applicable.
 */
let tray: Tray | null = null;

// Improve stack traces in production and activate debugging.

if (process.env.NODE_ENV === "production") {
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === "development" || process.env.DEBUG === "true") {
  electronDebug();
}

/**
 * Start the app.
 */
const launchApp = async () => {
  // Set up the tray and handlers.

  tray = new Tray(path.join(__dirname, "img/now-playing-tray.png"));
  mainWindow = new BrowserWindow({
    show: false,
    width: MAIN_WINDOW_DEFAULT_WIDTH,
    height: MAIN_WINDOW_DEFAULT_HEIGHT,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    closable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    title: APP_NAME,
    frame: false,
  });

  launchTray(mainWindow, tray).then();
  launchMainWindow(mainWindow).then();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Ensure authentication is up-to-date if needed.

  const areCredentialsOnDisk: boolean = await refreshPersistentCredentials();
  if (!areCredentialsOnDisk) {
    // The user either explicitly logged out last time, or this is their first time using the app. Note that if the
    // credentials were found but are very out of date, the very first request via the API that requires correct
    // authentication details will first prompt a refresh. If that doesn't work, the user must re-authenticate
    // manually by right-clicking the tray.

    await authenticateInBrowser();
  }

  activateFrequentPolling(mainWindow);
};

// Hide the dock if it is still visible. Without this, opening on the current workspace instead goes to a desktop.

if (app.dock) {
  app.dock.hide();
}

app.on("ready", async () => {
  await handleProtocolCalls();
  await launchApp();
});
