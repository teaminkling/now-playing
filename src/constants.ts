/**
 * The frontward-facing name of this application.
 */
export const APP_NAME = "Now Playing";

/**
 * The URI scheme/protocol of the auth flow for this app.
 *
 * For example, `now-playing` responds to `now-playing://...`.
 */
export const APP_PROTOCOL = "now-playing";

/**
 * The default un-resizable width of the window.
 */
export const MAIN_WINDOW_DEFAULT_WIDTH = 250;

/**
 * The default height of the window, noting it will flex with the size of the content.
 */
export const MAIN_WINDOW_DEFAULT_HEIGHT = 150;

/**
 * The URL users will be led to in order to provide their feedback or bug reports.
 */
export const FEEDBACK_URL = "https://github.com/teaminkling/now-playing/issues/new/choose";

/**
 * The required scopes for a user via the Spotify API.
 */
export const SPOTIFY_SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "playlist-read-collaborative",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-modify",
];

/**
 * The number of milliseconds to wait before polling for the current song.
 */
export const UPDATE_PERIOD = 750;
