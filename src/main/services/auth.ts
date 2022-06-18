import electron, {app} from "electron";
import {v4 as uuid4} from "uuid";
import {APP_PROTOCOL, SPOTIFY_SCOPES} from "../../constants";
import {spotifyApi} from "../handlers/spotify";
import {NowPlayingStoreKey, store} from "./store";

/**
 * Total number of times the app is allowed to critically fail to get auth information before crashing.
 */
const MAXIMUM_ALLOWED_CLEAR_AUTH_COUNT = 128;

/**
 * Total number of times the app has critically failed to get auth information.
 */
let clearAuthCount = 0;

/**
 * Handle calls to the Now Playing protocol as part of the auth flow process.
 *
 * Should be called once when setting up the application.
 */
export const handleProtocolCalls = async () => {
  app.setAsDefaultProtocolClient(APP_PROTOCOL);
  app.on("open-url", (event: Event, url: string) => {
    const capturedUrl = new URL(url);
    const capturedCode = capturedUrl.searchParams.get("code");
    if (capturedCode) {
      return saveTokenFromAuthCode(capturedCode);
    }
  });
};

/**
 * Open the authorization window in the user's default browser.
 *
 * ## Warnings
 *
 * Make sure your redirect URI is set in the Spotify Developer Portal and in your `secrets.ts` file!
 */
export const authenticateInBrowser = async () => {
  return electron.shell.openExternal(
    spotifyApi.createAuthorizeURL(SPOTIFY_SCOPES, uuid4())
  );
};

export const reauthenticate = async () => {
  try {
    refreshAccessToken().then(() => {
      const accessToken: string | undefined = store.get(NowPlayingStoreKey.ACCESS_TOKEN);
      if (!accessToken) {
        throw new Error("Access token was erroneously set when re-authenticating.");
      }
    }).catch(error => {
      console.error(error);

      throw new Error("Couldn't reauthenticate with refresh token.");
    });
  } catch (error) {
    // Refresh token didn't work, so reset auth and let the user re-login.

    clearAuth();
  }
};

/**
 * @returns {boolean} if the scopes retrieved from the API are enough to use the app
 */
export const areSavedScopesEnough = () => {
  const savedScopes = store.get(NowPlayingStoreKey.AUTHORIZED_SCOPES);
  if (!savedScopes) {
    return false;
  }

  const savedScopeArray: string[] = savedScopes.split(" ");
  return SPOTIFY_SCOPES.reduce(
    (result: boolean, scope: string) => result && savedScopeArray.includes(scope), true,
  );
};


/**
 * Using the auth code from a redirect, get the auth token to use with subsequent requests.
 *
 * ## Caveats
 *
 * This is a silent failure in production: the user will not be notified that this didn't work, but they'll realise
 * that the features of the app don't work and they can still "log in with Spotify" in the context menu.
 *
 * @param {string } authCode the authorisation code retrieved from the URL redirect in the default browser
 */
const saveTokenFromAuthCode = async (authCode: string) => {
  spotifyApi.authorizationCodeGrant(authCode).then(result => {
    const body = result.body;

    spotifyApi.setAccessToken(body.access_token);
    spotifyApi.setRefreshToken(body.refresh_token);

    store.set(NowPlayingStoreKey.ACCESS_TOKEN, body.access_token);
    store.set(NowPlayingStoreKey.REFRESH_TOKEN, body.refresh_token);
    store.set(NowPlayingStoreKey.AUTHORIZED_SCOPES, body.scope);
  }).catch(
    error => {
      console.error(error);

      clearAuth();
    }
  );
};

const clearAuth = () => {
  spotifyApi.setAccessToken("");
  spotifyApi.setRefreshToken("");

  store.set(NowPlayingStoreKey.ACCESS_TOKEN, undefined);
  store.set(NowPlayingStoreKey.REFRESH_TOKEN, undefined);
  store.set(NowPlayingStoreKey.AUTHORIZED_SCOPES, undefined);

  if (clearAuthCount++ > MAXIMUM_ALLOWED_CLEAR_AUTH_COUNT) {
    throw new Error("Too many auth failures!");
  }
};

/**
 * Using the refresh token, set authentication information.
 *
 * ## Warning
 *
 * Be careful calling this. Make sure you only call it once and when you need to. If a request fails, it should try
 * this and if it doesn't work after that, it should not retry it again.
 *
 * The app currently does not use the expiry of the access token to validate calling this function.
 */
const refreshAccessToken = async () => {
  spotifyApi.refreshAccessToken().then(response => {
    const body = response.body;

    spotifyApi.setAccessToken(body.access_token);

    store.set(NowPlayingStoreKey.ACCESS_TOKEN, body.access_token);
    if (body.refresh_token) {
      spotifyApi.setRefreshToken(body.refresh_token);

      store.set(NowPlayingStoreKey.REFRESH_TOKEN, body.refresh_token);
    }

    if (body.scope) {
      store.set(NowPlayingStoreKey.AUTHORIZED_SCOPES, body.scope);
    }
  });
};
