/**
 * This is the entrypoint for the Electron app.
 */

import { app, ipcMain, session } from 'electron';

import { handleMiniPlayer } from './components/mini-player';
import { initTray } from './components/tray';

import { handleAuthentication } from './helpers/authentication';
import { handleMediaPlayback } from './helpers/media-player';
import { MAIN_WINDOW_WIDTH } from "./constants";

/* Don't display the app in the macOS dock. */

if (app.dock) {
  app.dock.hide();
}

/* Finally, run the app. */

app.on(
  'ready',
  () => {
    /* Add content security policy header. */

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self';" +
            "style-src 'self' https://fonts.googleapis.com https://use.fontawesome.com;" +
            "font-src https://fonts.gstatic.com https://use.fontawesome.com"
          ]
        }
      })
    });

    /* The mini-player is a web component that exists as a drop-down underneath the tray. */

    let miniPlayer = handleMiniPlayer();

    ipcMain.on('fixHeight', (_event, height) => {
      miniPlayer.setSize(MAIN_WINDOW_WIDTH, height, true);
    });

    /* The (system) tray is the area of the screen with icons such as the WiFi icon. */

    let tray = initTray(miniPlayer);

    /* Authenticate, if required. */

    handleAuthentication(miniPlayer);

    /* Handle the control of the Spotify service from the software. */

    handleMediaPlayback(miniPlayer, tray);
  }
);
