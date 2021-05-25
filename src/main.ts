/**
 * This is the entrypoint for the Electron app.
 *
 * This software follows an "all roads lead to Rome" philosophy: all logic and live code can be traced to this file.
 * New contributors will want to start here.
 *
 */

import { app } from 'electron';

import { handleMiniPlayer } from './components/mini-player';
import { initTray } from './components/tray';

import { handleAuthentication } from './helpers/authentication';
import { handleMediaPlayback } from './helpers/media-player';

/* Don't display the app in the macOS dock. */

if (app.dock) {
    app.dock.hide();
}

/* Finally, run the app. */

app.on(
    'ready',
    () => {
        /* The mini-player is a web component that exists as a drop-down underneath the tray. */

        let miniPlayer = handleMiniPlayer();

        /* The (system) tray is the area of the screen with icons such as the WiFi icon. */

        let tray = initTray(miniPlayer);

        /* Authenticate, if required. */

        handleAuthentication(miniPlayer);

        /* Handle the control of the Spotify service from the software. */

        handleMediaPlayback(miniPlayer, tray);
    }
);
