"use strict";

const path = require("path");

const { app, BrowserWindow, Tray, Menu, ipcMain, shell } = require("electron");

const spotify = require("./domain/spotify-player");
const updater = require("./domain/updater");
const windowFactory = require("./helpers/window-factory");
const localStorage = require("./data/local");
const remote = require("@electron/remote/main");

const { authenticate, saveTokenFromAuthCode } = require("./data/authorization");

const { MAIN_WINDOW_WIDTH, FEEDBACK_LINK } = require("./helpers/constants");

let window;
let tray;

/**
 * Launch the app and all components.
 */
function launchApp() {
  // Handle tray.

  tray = new Tray(path.join(__dirname, "img/TrayTemplate.png"));

  tray.setIgnoreDoubleClickEvents(true);
  setTrayListeners(tray);

  // Allow using the renderer on the main window and ensure the widget is visible on all workspaces.

  remote.initialize();

  window = windowFactory.get("main");
  window.setVisibleOnAllWorkspaces(true, { "visibleOnFullScreen": true });

  // Load the interface.

  window.loadFile(path.join(__dirname, "presentation/html/index.html"));
  window.webContents.send("loading", {});

  // Set window listeners.

  window.on("closed", () => window = null);
  window.on("blur", () => window.hide());

  // Authenticate the user. While waiting, tell the user how to authenticate.

  authenticate();

  spotify.execute(window, tray);
  updater.execute(window);
}

function setTrayListeners(tray) {
  tray.on("right-click", () => manageTrayRightClick(tray));
  tray.on("click", (event, bounds) => {
    const windowWidth = window.getSize()[0];
    const trayWidth = bounds.width;
    const x = Math.round(bounds.x - windowWidth / 2 + trayWidth / 2);
    const y = bounds.y;
    window.setPosition(x, y);
    window.isVisible() ? hideAllWindows() : showAllWindows();
  });
}

/**
 * Hide all visible windows.
 */
function hideAllWindows() {
  BrowserWindow.getAllWindows().forEach(_window => _window.hide());
}

/**
 * Show all windows that can be shown.
 *
 * Any window that isn't the main widget needs to be centred on the screen. As of writing, there are no such windows
 * so this is just a leftover contingency.
 */
function showAllWindows() {
  BrowserWindow.getAllWindows().forEach(_window => {
    _window.show();

    if (_window.id !== window.id) {
      _window.center();
    }
  });
}

function manageTrayRightClick(_tray) {
  const openAtLogin = app.getLoginItemSettings().openAtLogin;
  const activateNotifications = localStorage.get("activateNotifications");
  const songMenubar = localStorage.get("songMenubar");
  window.hide();

  const openAtLoginPayload = {
    label: "Open at Login",
    type: "checkbox",
    checked: openAtLogin,
    click: () => app.setLoginItemSettings({ openAtLogin: !openAtLogin })
  };

  const separatorPayload = {
    type: "separator"
  };

  const showNotificationsPayload = {
    label: "Show Notifications",
    type: "checkbox",
    checked: activateNotifications,
    click: () => localStorage.save("activateNotifications", !localStorage.get("activateNotifications"))
  };

  const showSongOnTrayPayload = {
    label: "Show Song on Tray",
    type: "checkbox",
    checked: songMenubar,
    click: function () {
      localStorage.save("songMenubar", !songMenubar);

      if (songMenubar) {
        _tray.setTitle("");
      }
    }
  };

  const giveFeedbackPayload = {
    label: "Give feedback!",
    click: () => shell.openExternal(FEEDBACK_LINK)
  };

  const currentAccessToken = localStorage.get("accessToken");
  const logInOutPayload = currentAccessToken ? {
    label: "Log Out",
    click: function () {
      // This will force a re-authenticate with Spotify.

      localStorage.save("accessToken", undefined);
      localStorage.save("refreshToken", undefined);
      localStorage.save("userUri", undefined);

      // Neutralise the title.

      _tray.setTitle("");
    }
  } : {
    label: "Log In with Spotify",
    click: function () {
      authenticate(true);

      // Either neutralise the title or prepare for it to be re-written.

      _tray.setTitle("");
    }
  };

  const quitPayload = {
    label: "Quit",
    click: function () {
      window.setClosable(true);
      window = undefined;

      app.quit();
    }
  };

  const trayMenu = Menu.buildFromTemplate([
    openAtLoginPayload,
    separatorPayload,
    showNotificationsPayload,
    showSongOnTrayPayload,
    separatorPayload,
    giveFeedbackPayload,
    separatorPayload,
    logInOutPayload,
    quitPayload,
  ]);

  tray.popUpContextMenu(trayMenu);
}

ipcMain.on(
  "fixHeight",
  (event, height) => window.setSize(MAIN_WINDOW_WIDTH, height, true)
);

// Hide the dock if it is still visible. Without this, opening on the current workspace instead goes to a desktop.

if (app.dock) {
  app.dock.hide();
}

// Add a listener to deal with the callback when performing authentication.

app.setAsDefaultProtocolClient("now-playing");
app.on("open-url", (event, url) => {
  const capturedUrl = new URL(url);
  const capturedCode = capturedUrl.searchParams.get("code");

  if (capturedCode) {
    saveTokenFromAuthCode(capturedCode);
  }
});

// Start the app listener on ready.

app.on("ready", launchApp);
