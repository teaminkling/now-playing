/**
 * All code related to the mini-player web component.
 */

import path from "path";

import { BrowserWindow, Menu } from 'electron';

import { APP_NAME, MAIN_WINDOW_HEIGHT, MAIN_WINDOW_WIDTH } from '../constants';

export function handleMiniPlayer() {
  /* Create the mini-player web view. */

  const miniPlayer = new BrowserWindow({
    /* Size. */

    width: MAIN_WINDOW_WIDTH,
    height: MAIN_WINDOW_HEIGHT,

    /* Meta-information. */

    title: APP_NAME,

    /* Abilities. */

    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    alwaysOnTop: true,
    fullscreenable: false,

    /* Display options. */

    show: false,
    frame: false,

    /* Other options. */

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  /* Configure what can't be constructed with options. */

  miniPlayer.setVisibleOnAllWorkspaces(true);

  /* When the app is enabled, configure the application menu. This is made visible if the mini-player is visible. */

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'Edit',
      submenu: [
        {label: 'Copy', accelerator: 'CmdOrCtrl+C'},
        {label: 'Paste', accelerator: 'CmdOrCtrl+V'},
        {label: 'Select All', accelerator: 'CmdOrCtrl+A'},
      ],
    },
  ]));

  /* Populate the window with HTML and set the initial loading state. */

  miniPlayer.loadFile(path.join(__dirname, '../../index.html')).then(null);
  miniPlayer.webContents.send('loading', {});

  return miniPlayer;
}

/* Exports. */

exports.handleMiniPlayer = handleMiniPlayer;
