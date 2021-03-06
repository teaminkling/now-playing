'use strict';
const env = require('../../.env.json');

module.exports = {
  SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
  SPOTIFY_SCOPES: env.SPOTIFY_SCOPES,
  REDIRECT_URI: env.REDIRECT_URI,
  APP_NAME: 'Now Playing',
  FEEDBACK_LINK: 'https://github.com/teaminkling/mac-spotify-np/issues/new?assignees=&labels=enhancement&template=feature-request.md&title=',
  MAIN_WINDOW_WIDTH: 250,
  MAIN_WINDOW_HEIGHT: 150,
  UPDATER_WINDOW_WIDTH: 500,
  UPDATER_WINDOW_HEIGHT: 250,
  UPDATE_PERIOD: 750,
  SONG_TITLE_MAX_LENGTH: 64,
  ERROR_MESSAGES: {
    getCurrentPlayback: 'getCurrentPlayback',
    getSpotifyTokenFromAuthCode: 'getSpotifyTokenFromAuthCode',
    getSpotifyTokenFromRefreshToken: 'getSpotifyTokenFromRefreshToken',
    getSpotifyCurrentUser: 'getSpotifyCurrentUser',
    getPlaylists: 'getPlaylists',
    addTrackToPlaylist: 'addTrackToPlaylist',
    getAppLatestVersion: 'getAppLatestVersion',
    downloadAppLatestVersion: 'downloadAppLatestVersion'
  }
};
