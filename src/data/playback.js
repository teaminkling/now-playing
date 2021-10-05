/**
 * This file handles the playback and playlist/library management operations with the Spotify web API.
 */

"use strict";

const fetch = require("electron-fetch").default;
const spotifyCodes = require("../../.env.json");
const localStorage = require("./local");

const SPOTIFY_CLIENT_ID = spotifyCodes["SPOTIFY_CLIENT_ID"];
const SPOTIFY_CLIENT_SECRET = spotifyCodes["SPOTIFY_CLIENT_SECRET"];

// Constants:

/**
 * The base Spotify User endpoint URL. Most API URLs derive from this one.
 *
 * Note that there is no slash at the end.
 */
const SPOTIFY_USER_ENDPOINT_URL = "https://api.spotify.com/v1/me";

/**
 * The base Spotify Playlists endpoint URL.
 *
 * Note that this is not the same as the user's playlists endpoint.
 */
const SPOTIFY_PLAYLISTS_ENDPOINT_URL = "https://api.spotify.com/v1/playlists";

/**
 * The API URL to get the user's library/tracks.
 *
 * Note that this is part of the user API.
 */
const SPOTIFY_USER_TRACKS_URL = `${SPOTIFY_USER_ENDPOINT_URL}/tracks`;

/**
 * The API URL to get the user's playlists.
 *
 * Note that this is part of the user API.
 */
const SPOTIFY_USER_PLAYLISTS_URL = `${SPOTIFY_USER_ENDPOINT_URL}/playlists`;

/**
 * The API URL to get the current playback.
 */
const SPOTIFY_USER_CURRENT_PLAYBACK_URL = `${SPOTIFY_USER_ENDPOINT_URL}/player`;

/**
 * The API URL for setting the current playback shuffle state.
 *
 * A state must be passed in as a URL query parameter for this to work correctly.
 */
const SPOTIFY_USER_SHUFFLE_PLAYBACK_URL = `${SPOTIFY_USER_ENDPOINT_URL}/player/shuffle`;

/**
 * The API URL for going to the previous track.
 */
const SPOTIFY_USER_PREVIOUS_TRACK_URL = `${SPOTIFY_USER_ENDPOINT_URL}/player/previous`;

/**
 * The API URL for resuming playback.
 */
const SPOTIFY_USER_PLAY_PLAYBACK_URL = `${SPOTIFY_USER_ENDPOINT_URL}/player/play`;

/**
 * The API URL for pausing playback.
 */
const SPOTIFY_USER_PAUSE_PLAYBACK_URL = `${SPOTIFY_USER_ENDPOINT_URL}/player/pause`;

/**
 * The API URL for going to the next track.
 */
const SPOTIFY_USER_NEXT_TRACK_URL = `${SPOTIFY_USER_ENDPOINT_URL}/player/next`;

/**
 * The maximum number of playlists allowed to be fetched per user.
 *
 * This cannot be higher than 50 per page.
 */
const MAX_PLAYLISTS_COUNT = 50;

// Actions:

/**
 * Get an auth token from the given body.
 *
 * This may be called from an auth code (on callback on first authentication) or via a refresh token.
 *
 * @param body the URLSearchParams for the POST request
 * @returns {Promise<any>} the response from Spotify's API
 */
exports.getToken = function (body) {
  const authorization = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  return fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: body.toString(),
    headers: { "Authorization": `Basic ${authorization}`, "Content-Type": "application/x-www-form-urlencoded" },
  }).then(response => response.json());
};

exports.shuffle = function (accessToken, state) {
  return fetchAndReturnJson(`${SPOTIFY_USER_SHUFFLE_PLAYBACK_URL}?state=${state}`, "PUT", accessToken);
};

exports.previousTrack = function (accessToken) {
  return fetchAndReturnJson(SPOTIFY_USER_PREVIOUS_TRACK_URL, "POST", accessToken);
};

exports.play = function (accessToken) {
  return fetchAndReturnJson(SPOTIFY_USER_PLAY_PLAYBACK_URL, "PUT", accessToken);
};

exports.pause = function (accessToken) {
  return fetchAndReturnJson(SPOTIFY_USER_PAUSE_PLAYBACK_URL, "PUT", accessToken);
};

exports.nextTrack = function (accessToken) {
  return fetchAndReturnJson(SPOTIFY_USER_NEXT_TRACK_URL, "POST", accessToken);
};

exports.addTrackToPlaylist = function (accessToken, playlistId, uri) {
  const url = `${SPOTIFY_PLAYLISTS_ENDPOINT_URL}/${playlistId}/tracks?uris=${encodeURIComponent(uri)}`;

  return fetchAndReturnJson(url, "POST", accessToken);
};

exports.addTrackToLibrary = function (accessToken, uri) {
  const trackId = uri.split(":").pop();
  const url = `${SPOTIFY_USER_TRACKS_URL}?ids=${trackId}`;

  return fetchAndReturnJson(url, "PUT", accessToken);
};

// Pure data retrieval:

exports.getCurrentUser = function (accessToken) {
  return fetchAndReturnJson(SPOTIFY_USER_ENDPOINT_URL, "GET", accessToken);
};

exports.getCurrentPlayback = function (accessToken) {
  return fetchAndReturnJson(SPOTIFY_USER_CURRENT_PLAYBACK_URL, "GET", accessToken);
};

// FIXME: Call on login.

exports.getPlaylists = function (accessToken) {
  const url = `${SPOTIFY_USER_PLAYLISTS_URL}?limit=${MAX_PLAYLISTS_COUNT}`;
  return fetchAndReturnJson(url, "GET", accessToken).then(json => {
    // Grab all paginated endpoints if there's more than one page.

    const paginatedEndpoints = determinePaginatedPlaylistUrls(json.total);
    if (!paginatedEndpoints) {
      return json.items;
    }

    // Fetch all playlists in a single array and return.

    const pageResults = paginatedEndpoints.map(endpoint => fetchAndReturnJson(endpoint, "GET", accessToken));
    return Promise.all(pageResults).then(data => data.map(response => response.items).reduce(
      (result, item) => result.concat(item), [])
    );
  }).then(
    allPlaylists => allPlaylists.filter(playlist => playlist["collaborative"] || isPlaylistFromCurrentUser(playlist))
  );
};

// Helper functions:

/**
 * Simply fetch the provided URL with the method and access token. Return the JSON response as a {@link Promise}.
 *
 * If the response is successful with no body, an empty JSON object is returned instead.
 *
 * @param url the URL to GET
 * @param method the HTTP method
 * @param accessToken the access token for the authenticated user
 * @returns {Promise<any>} a JSON response from the URL after a request
 */
function fetchAndReturnJson(url, method, accessToken) {
  return fetch(url, { method: method, headers: { "Authorization": `Bearer ${accessToken}` } }).then(
    response => response.json().catch(
      (reason) => {
        if (response.ok) {
          return {};
        }

        throw reason;
      })
  ).catch((reason) => {
    console.error(reason);
  });
}

function determinePaginatedPlaylistUrls(totalPlaylistCount) {
  const pagesCount = Math.ceil(totalPlaylistCount / MAX_PLAYLISTS_COUNT);

  // Don't bother figuring out additional needed pages if one is enough.

  if (pagesCount === 1) {
    return null;
  }

  // Discover all endpoints for the page count required.

  const pageRange = Array.from(Array(pagesCount).keys());
  return pageRange.map(
    (number) => {
      const offset = MAX_PLAYLISTS_COUNT * number;

      return `${SPOTIFY_USER_PLAYLISTS_URL}?offset=${offset}&limit=${MAX_PLAYLISTS_COUNT}`;
    }
  );
}

/**
 * @param playlist the playlist to check
 * @returns {boolean} whether the given playlist belongs to the logged-in user
 */
function isPlaylistFromCurrentUser(playlist) {
  return playlist.owner.uri === localStorage.get("userUri");
}
