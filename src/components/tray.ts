/**
 * All code related to the tray system component.
 */

import path from 'path';

import { app, BrowserWindow, Menu, MenuItemConstructorOptions, Rectangle, shell, Tray } from 'electron';

import { get, set } from '../data/local-storage';

import { APP_NAME, FEEDBACK_LINK } from '../constants';


/**
 * Initialise the system tray icon.
 *
 * @param miniPlayer the mini-player {@link BrowserWindow}
 */
export function initTray(miniPlayer: BrowserWindow) {
  /* Load the tray into the global scope. */

  const tray = new Tray(path.join(__dirname, 'img/iconTemplate.png'));

  /* Configure the tray. */

  tray.setIgnoreDoubleClickEvents(true);

  /* Set listeners for the tray. */

  tray.on('right-click', () => manageTrayRightClick(miniPlayer, tray));
  tray.on('click', (_event, bounds) => {
    manageTrayLeftClick(miniPlayer, bounds);
  });

  return tray;
}

/**
 * The listener function for when the user left-clicks the tray icon.
 *
 * @param miniPlayer the mini-player {@link BrowserWindow}
 * @param bounds the bounding {@link Rectangle} for the mini-player window
 */
function manageTrayLeftClick(miniPlayer: BrowserWindow, bounds: Rectangle) {
  /* Determine location of mini-player. */

  const windowWidth = miniPlayer.getSize()[0];
  const trayWidth = bounds.width;
  const x = Math.round(bounds.x - windowWidth / 2 + trayWidth / 2);
  const y = bounds.y;

  miniPlayer.setPosition(x, y);

  /* Toggle mini-player. */

  if (miniPlayer.isVisible()) {
    BrowserWindow.getAllWindows().forEach(foundWindow => foundWindow.hide());
  } else {
    BrowserWindow.getAllWindows().forEach(foundWindow => {
      foundWindow.show();

      /* Move web views (like Spotify Auth) to the center of the screen. */

      if (foundWindow.id !== miniPlayer.id) {
        foundWindow.center();
      }
    });
  }
}

/**
 * The listener function for when the user right-clicks the tray icon.
 *
 * @param miniPlayer the mini-player {@link BrowserWindow}
 * @param tray the system {@link Tray}
 */
function manageTrayRightClick(miniPlayer: BrowserWindow, tray: Tray) {
  miniPlayer.hide();

  /* Should the app open at login? */

  const openAtLogin = app.getLoginItemSettings().openAtLogin;

  /* Are notifications turned on? */

  const activateNotifications = get('activateNotifications');

  /* Should the app show the song in the menu bar? */

  const songMenubar = get('songMenubar');

  /* Handle right-click menu. */

  const trayMenuTemplate: MenuItemConstructorOptions[] = [
    {
      label: APP_NAME,
      enabled: false
    },
    {
      label: 'Open at Login',
      type: 'checkbox',
      checked: openAtLogin,
      click: () => app.setLoginItemSettings({ openAtLogin: !openAtLogin })
    },
    {
      label: 'Submit Feedback',
      click: () => shell.openExternal(FEEDBACK_LINK)
    },
    {
      type: 'separator'
    },
    {
      label: 'Activate Notifications',
      type: 'checkbox',
      checked: activateNotifications,
      click: () => set('activateNotifications', !get('activateNotifications'))
    },
    {
      label: 'Show Song in Menu Bar',
      type: 'checkbox',
      checked: songMenubar,
      click: function () {
        set('songMenubar', !songMenubar);

        if (songMenubar) {
          tray.setTitle('');
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: function () {
        miniPlayer.setClosable(true);

        app.quit();
      }
    }
  ];

  const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);

  tray.popUpContextMenu(trayMenu);
}

/* Exports. */

exports.handleTray = initTray;
