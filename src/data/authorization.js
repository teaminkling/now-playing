/**
 * This file manages authorization with the Spotify web API.
 */

"use strict";

const electron = require("electron");

const localStorage = require("./local");
const spotifyDataSource = require("./playback");
const errorReporter = require("../helpers/error-reporter");

const { SPOTIFY_SCOPES, REDIRECT_URI, SPOTIFY_CLIENT_ID } = require("../helpers/constants");

/**
 * Without query string parameters, the Spotify API authorization endpoint URL.
 */
const SPOTIFY_AUTHORIZE_ENDPOINT_URL = "https://accounts.spotify.com/en/authorize";

/**
 * Save the current user in local storage, if successful.
 *
 * Running this function will either use stored information to authenticate, or will open a new browser window to
 * authenticate.
 *
 * This function is to be used by running it repeatedly with a short delay until the user is authenticated. One
 * iteration should really be enough, but two may be necessary if the refresh token is passed through.
 *
 * @return boolean whether the authentication was successful/is waiting for something else (i.e., shouldn't be re-run)
 */
exports.authenticate = () => {
  const accessToken = localStorage.get("accessToken");
  if (!accessToken || !areSavedScopesEnough()) {
    openOauth2WindowInDefaultBrowser();

    // When receiving the callback, this should re-call the authentication method.

    return true;
  }

  spotifyDataSource.getCurrentUser(accessToken).then(user => {
    // We know we have success when the user's URI is known from the call.

    if (user.uri) {
      localStorage.save("userUri", user.uri);

      return true;
    }

    // If existing call didn't work, we need to refresh the token if we can.

    const refreshToken = localStorage.get("refreshToken");
    if (!refreshToken) {
      throw Error("Local storage didn't have a refresh token nor a valid access token. Please reauthenticate.");
    }

    getTokenFromRefreshToken(refreshToken);

    return false;
  }).catch(error => errorReporter.emit("getSpotifyCurrentUser", error));
};

/**
 * Using the auth code from the redirect, get the auth token.
 *
 * @param authCode the auth code from the URL redirect in the default browser
 */
exports.saveTokenFromAuthCode = authCode => {
  const body = new URLSearchParams();

  body.append("grant_type", "authorization_code");
  body.append("code", authCode);
  body.append("redirect_uri", REDIRECT_URI);

  spotifyDataSource.getToken(body)
    .then(json => {
      if (json["access_token"]) {
        localStorage.save("accessToken", json["access_token"]);
        localStorage.save("refreshToken", json["refresh_token"]);
        localStorage.save("authorizedScopes", json["scope"]);
      } else {
        // If the retrieval didn't work, remove all local storage information.

        localStorage.save("userUri", undefined);
        localStorage.save("refreshToken", undefined);
        localStorage.save("accessToken", undefined);
      }
    }).catch(error => errorReporter.emit("getSpotifyTokenFromAuthCode", error));
};

/**
 * Open the authorization window in the user's default browser.
 *
 * @returns {Promise<void>} a {@link Promise} that will resolve once the URL is opened in the default browser
 */
const openOauth2WindowInDefaultBrowser = () => {
  // An example of a callback URL is: now-playing://auth/?code=snip

  const url = (
    SPOTIFY_AUTHORIZE_ENDPOINT_URL
    + `?client_id=${SPOTIFY_CLIENT_ID}`
    + `&response_type=code`
    + `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    + `&scope=${encodeURI(SPOTIFY_SCOPES)}`
  );

  electron.shell.openExternal(url).then();
};

/**
 * Using the refresh token, set authentication information.
 *
 * @param refreshToken the refresh token
 */
function getTokenFromRefreshToken(refreshToken) {
  const body = new URLSearchParams();

  body.append("grant_type", "refresh_token");
  body.append("refresh_token", refreshToken);

  spotifyDataSource.getToken(body).then(json => {
    if (json["access_token"]) {
      localStorage.save("accessToken", json["access_token"]);

      if (json["refresh_token"]) {
        localStorage.save("refreshToken", json["refresh_token"]);
      }
    } else {
      // If the refresh didn't work, remove all local storage information.

      localStorage.save("userUri", undefined);
      localStorage.save("refreshToken", undefined);
      localStorage.save("accessToken", undefined);
    }
  }).catch(error => errorReporter.emit("getSpotifyTokenFromRefreshToken", error));
}

/**
 * @returns {boolean} if the scopes retrieved from the API are enough to use the app
 */
function areSavedScopesEnough() {
  const savedScopes = localStorage.get("authorizedScopes");
  if (!savedScopes) {
    return false;
  }

  const savedScopesArray = savedScopes.split(" ");
  const appScopesArray = SPOTIFY_SCOPES.split(" ");

  return appScopesArray.reduce((result, scope) => result && savedScopesArray.includes(scope), true);
}
