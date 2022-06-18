import {app, BrowserWindow, Menu, Rectangle, shell, Tray} from "electron";
import {FEEDBACK_URL} from "../../constants";
import {areSavedScopesEnough, authenticateInBrowser} from "../services/auth";
import {NowPlayingStoreKey, store} from "../services/store";

/**
 * A shorthand for a menu item separator payload.
 */
const MENU_ITEM_SEPARATOR: Electron.MenuItemConstructorOptions = {type: "separator"};

/**
 * A static menu item for providing feedback.
 */
const MENU_ITEM_FEEDBACK: Electron.MenuItemConstructorOptions = {
  label: "Give feedback!", click: () => shell.openExternal(FEEDBACK_URL)
};

/**
 * Handle the initialised tray.
 *
 * @param {Electron.BrowserWindow} mainWindow the main window
 * @param {Electron.Tray} tray the system tray icon
 */
export const launchTray = async (mainWindow: BrowserWindow, tray: Tray) => {
  tray.setIgnoreDoubleClickEvents(true);

  tray.on(
    "click",
    (_event: Electron.KeyboardEvent, bounds: Rectangle) => handleLeftClick(mainWindow, bounds),
  );

  tray.on(
    "right-click",
    (_event: Electron.KeyboardEvent, _bounds: Rectangle) => handleRightClick(mainWindow, tray)
  );
};

/**
 * Set the main window to the correct location on click and toggle the main window.
 *
 * @param {Electron.BrowserWindow} mainWindow the main window
 * @param {Electron.Rectangle} bounds the bounds of the tray
 */
const handleLeftClick = (mainWindow: BrowserWindow, bounds: Rectangle) => {
  const windowWidth = mainWindow.getSize()[0];
  const trayWidth = bounds.width;

  const x = Math.round(bounds.x - windowWidth / 2 + trayWidth / 2);
  const y = bounds.y;

  mainWindow.setPosition(x, y);
  mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
};

/**
 * Handle the context menu on right click.
 *
 * @param {Electron.BrowserWindow} mainWindow the main window
 * @param {Electron.Tray} tray the system tray icon
 */
const handleRightClick = (mainWindow: BrowserWindow, tray: Tray) => {
  mainWindow.hide();

  // Get configuration options.

  const openAtLogin: boolean = app.getLoginItemSettings().openAtLogin;
  const hasNotifications: boolean = store.get(NowPlayingStoreKey.HAS_NOTIFICATIONS);
  const hasSongInTray: boolean = store.get(NowPlayingStoreKey.HAS_SONG_IN_TRAY);
  const isLoggedIn = !!store.get(NowPlayingStoreKey.ACCESS_TOKEN) && areSavedScopesEnough();

  const openAtLoginMenuItem: Electron.MenuItemConstructorOptions = {
    label: "Open at Login", type: "checkbox", checked: openAtLogin, click: () => {
      app.setLoginItemSettings({openAtLogin: !openAtLogin});
    },
  };

  const hasNotificationsMenuItem: Electron.MenuItemConstructorOptions = {
    label: "Show Notifications", type: "checkbox", checked: hasNotifications, click: () => {
      store.set("activateNotifications", !hasNotifications);
      if (hasNotifications) {
        // TODO: Send a test notification here or explicitly request for permissions.
      }
    },
  };

  const hasSongInTrayMenuItem: Electron.MenuItemConstructorOptions = {
    label: "Show Song on Tray", type: "checkbox", checked: hasSongInTray, click: () => {
      store.set("songMenubar", !hasSongInTray);
      if (!hasSongInTray) {
        tray.setTitle("");
      }
    }
  };

  const authenticateMenuItem: Electron.MenuItemConstructorOptions = isLoggedIn ? {
    label: "Log Out", click: () => {
      tray.setTitle("");

      // This will force a re-authenticate with Spotify.

      store.set(NowPlayingStoreKey.ACCESS_TOKEN, undefined);
      store.set(NowPlayingStoreKey.REFRESH_TOKEN, undefined);
      store.set(NowPlayingStoreKey.USER_ID, undefined);
    }
  } : {
    label: "Log In with Spotify",
    click: () => {
      tray.setTitle("");

      authenticateInBrowser().then();
    }
  };

  const quitPayload: Electron.MenuItemConstructorOptions = {
    label: "Quit", click: () => app.quit(),
  };

  const trayMenu = Menu.buildFromTemplate([
    openAtLoginMenuItem,
    MENU_ITEM_SEPARATOR,
    hasNotificationsMenuItem,
    hasSongInTrayMenuItem,
    MENU_ITEM_SEPARATOR,
    MENU_ITEM_FEEDBACK,
    MENU_ITEM_SEPARATOR,
    authenticateMenuItem,
    quitPayload,
  ]);

  tray.popUpContextMenu(trayMenu);
};
