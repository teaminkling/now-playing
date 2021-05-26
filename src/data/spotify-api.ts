import fetch from 'electron-fetch';

import { get } from './local-storage';

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "../constants";

const SPOTIFY_API_BASE_URL: string = "https://api.spotify.com/v1";


export function getCurrentPlayback(accessToken: string) {
  return fetch(`${SPOTIFY_API_BASE_URL}/me/player`, {
    method: 'GET',
    headers: {'Authorization': `Bearer ${accessToken}`}
  }).then(res => res.json());
}

export function shuffle(accessToken: string, state: boolean) {
  return fetch(`${SPOTIFY_API_BASE_URL}/me/player/shuffle?state=${state}`, {
    method: 'PUT',
    headers: {'Authorization': `Bearer ${accessToken}`}
  });
}

/*
 * Playback.
 */

export function nextTrack(accessToken: string) {
  return fetch(`${SPOTIFY_API_BASE_URL}/me/player/next`, {
    method: 'POST',
    headers: {'Authorization': `Bearer ${accessToken}`}
  });
}

export function previousTrack(accessToken: string) {
  return fetch(`${SPOTIFY_API_BASE_URL}/me/player/previous`, {
    method: 'POST',
    headers: {'Authorization': `Bearer ${accessToken}`}
  });
}

export function play(accessToken: string) {
  return fetch(`${SPOTIFY_API_BASE_URL}/me/player/play`, {
    method: 'PUT',
    headers: {'Authorization': `Bearer ${accessToken}`}
  });
}

export function pause(accessToken: string) {
  return fetch(`${SPOTIFY_API_BASE_URL}/me/player/pause`, {
    method: 'PUT',
    headers: {'Authorization': `Bearer ${accessToken}`}
  });
}

/*
 * Playlists.
 */

export function getPlaylists(accessToken: string) {
  const limit = 50;
  const fetchOptions = {
    method: 'GET',
    headers: {'Authorization': `Bearer ${accessToken}`}
  };

  return fetch(`${SPOTIFY_API_BASE_URL}/me/playlists?limit=${limit}`, fetchOptions)
    .then(res => res.json())
    .then(json => {
      const numberOfRequests = Math.ceil(json.total / limit);
      if (numberOfRequests === 1) {
        return json.items;
      }

      const endpoints: string[] = [...Array(numberOfRequests)].map(
        (_, request) => `${SPOTIFY_API_BASE_URL}/me/playlists?offset=${limit * request}&limit=${limit}`
      );

      return Promise.all(
        endpoints.map(
          /* Make each request then map to a JSON response. */

          endpoint => fetch(endpoint, fetchOptions).then(res => res.json())
        )
      ).then(data => data.map(res => res.items).reduce((result, item) => result.concat(item), []));
    }).then(data => data.filter((playlist: any) => {
      playlist.collaborative || isPlaylistFromCurrentUser(playlist);
    }));
}

export function addTrackToPlaylist(accessToken: string, playlistId: string, uri: string) {
  return fetch(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks?uris=${encodeURIComponent(uri)}`, {
    method: 'POST',
    headers: {'Authorization': `Bearer ${accessToken}`}
  }).then(res => res.json());
}

/*
 * Library.
 */

export function addTrackToLibrary(accessToken: string, uri: string) {
  const id = uri.split(':').pop();
  return fetch(`${SPOTIFY_API_BASE_URL}/tracks?ids=${id}`, {
    method: 'PUT',
    headers: {'Authorization': `Bearer ${accessToken}`}
  });
}

/*
 * User.
 */

export function getCurrentUser(accessToken: string) {
  return fetch(`${SPOTIFY_API_BASE_URL}/me`, {
    method: 'GET',
    headers: {'Authorization': `Bearer ${accessToken}`}
  }).then(res => res.json());
}

function isPlaylistFromCurrentUser(playlist: any) {
  return playlist.owner.uri === get('userUri');
}

export function getToken(body: any) {
  body.append('client_id', SPOTIFY_CLIENT_ID);
  body.append('client_secret', SPOTIFY_CLIENT_SECRET);

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: body.toString(),
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  }).then(res => res.json());
}
