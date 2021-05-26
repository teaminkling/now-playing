// noinspection NestedFunctionJS

import { BrowserWindow } from "electron";

import { get, set } from '../data/local-storage';
import { getCurrentUser, getToken } from '../data/spotify-api';

import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SPOTIFY_SCOPES } from '../constants';

/**
 * The base URL for the Spotify account endpoint.
 */
const SPOTIFY_ACCOUNT_BASE_URL: string = "https://accounts.spotify.com/en/authorize";

let authorizing: boolean;

export function handleAuthentication(miniPlayer: BrowserWindow) {
  if (authorizing) {
    return;
  }

  authorizing = true;

  const subject = prepareSubjects();

  subject.on('errorCurrentUser', handleErrorCurrentUser);
  subject.on('authCode', getTokenFromAuthCode);
  subject.on('token', retrieveCurrentUser);
  subject.on('errorTokenFromRefreshToken', getAuthorization);
  subject.on('errorTokenFromAuthCode', getAuthorization);

  const accessToken: string = get('accessToken');

  if (accessToken && areSavedScopesEnough()) {
    retrieveCurrentUser(accessToken);
  } else {
    getAuthorization();
  }

  function retrieveCurrentUser(token: any) {
    getCurrentUser(token)
      .then((user: any) => {
        if (user.uri) {
          set('userUri', user.uri);
          authorizing = false;
        } else {
          subject.emit('errorCurrentUser', null);
        }
      });
  }

  function handleErrorCurrentUser() {
    const refreshToken = get('refreshToken');

    if (!refreshToken) {
      getAuthorization();
    }

    getTokenFromRefreshToken(refreshToken);
  }

  function getAuthorization() {
    const spotifyAuthWindow = new BrowserWindow({
      parent: miniPlayer,
      modal: true,
      show: false,
      webPreferences: {
        nodeIntegration: false
      }
    });

    /* Form the auth URL. */

    const clientIdParam: string = `client_id=${SPOTIFY_CLIENT_ID}`;
    const responseTypeParam: string = `response_type=code`;
    const redirectUriParam: string = `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}`;
    const scopeStringParam: string = `scope=${encodeURI(SPOTIFY_SCOPES.join(" "))}`;
    const spotifyAuthUrlParams: string = (
      `?${clientIdParam}&${responseTypeParam}&${redirectUriParam}&${scopeStringParam}`
    );

    const spotifyAuthUrl: string = `${SPOTIFY_ACCOUNT_BASE_URL}${spotifyAuthUrlParams}`;

    spotifyAuthWindow.loadURL(spotifyAuthUrl).then(null);

    spotifyAuthWindow.once('ready-to-show', () => spotifyAuthWindow.show());

    const webContents = spotifyAuthWindow.webContents;

    webContents.on('did-finish-load', () => {
      const url = webContents.getURL();
      const urlQueryParams = url.split('?')[1] || '';
      const urlSearchParams = new URLSearchParams(urlQueryParams);
      const code = urlSearchParams.get('code');

      if (isDomainUrlRedirectUri(url.split('?')[0]) && code) {
        spotifyAuthWindow.destroy();

        const authCode = code.split('#')[0];
        subject.emit('authCode', authCode);
      }
    });
  }

  function getTokenFromAuthCode(authCode: string) {
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', authCode);
    body.append('redirect_uri', SPOTIFY_REDIRECT_URI);

    getToken(body)
      .then((json: any) => {
        if (json.access_token) {
          set('accessToken', json.access_token);
          set('refreshToken', json.refresh_token);
          set('authorizedScopes', json.scope);
          subject.emit('token', json.access_token);
        } else {
          subject.emit('errorTokenFromAuthCode', null);
        }
      });
  }

  function getTokenFromRefreshToken(refreshToken: string) {
    const body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', refreshToken);

    getToken(body)
      .then((json: any) => {
        if (json.access_token) {
          set('accessToken', json.access_token);
          if (json.refresh_token) {
            set('refreshToken', json.refresh_token)
          }
          subject.emit('token', json.access_token);
        } else {
          subject.emit('errorTokenFromRefreshToken', null);
        }
      });
  }
}

function prepareSubjects() {
  const listeners: { [key: string]: any } = {};

  function on(eventType: string, callback: CallableFunction) {
    listeners[eventType] = listeners[eventType] || [];
    listeners[eventType].push(callback);
  }

  function emit(eventType: string, data: any) {
    const callbacks = listeners[eventType];
    if (!callbacks) {
      return;
    }

    callbacks.forEach((callback: CallableFunction) => callback(data));
  }

  return {
    on,
    emit
  };
}

function isDomainUrlRedirectUri(domainUrl: string) {
  return domainUrl === SPOTIFY_REDIRECT_URI;
}

function areSavedScopesEnough() {
  const savedScopes = get('authorizedScopes');
  if (!savedScopes) {
    return false;
  }

  const savedScopesArray: string[] = savedScopes.split(" ");

  return SPOTIFY_SCOPES.reduce(
    (result: boolean, scope: string) => {
      return result && savedScopesArray.includes(scope);
    },
    true,
  );
}
