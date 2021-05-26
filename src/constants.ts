/**
 * Runtime constants, calculated once. Includes environment variable reads.
 */

import * as dotenv from "dotenv";

/*
 * Set environment variable-based constants.
 */

dotenv.config();

/**
 * The Spotify API client ID.
 */
export const SPOTIFY_CLIENT_ID: string = process.env.SPOTIFY_CLIENT_ID!.trim();

/**
 * The Spotify API client secret.
 */
export const SPOTIFY_CLIENT_SECRET: string = process.env.SPOTIFY_CLIENT_SECRET!.trim();

/**
 * The redirect URI for the Spotify API.
 *
 * This needs to be known on the Spotify application definition.
 */
export const SPOTIFY_REDIRECT_URI: string = process.env.REDIRECT_URI!.trim();

/*
 * Standard static code-level constants.
 */

/**
 * The scopes required for Spotify's API.
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
 * The name of the application.
 */
export const APP_NAME: string = "Spotify Now Playing";

/**
 * A hyperlink to the feedback site.
 */
export const FEEDBACK_LINK: string = "https://github.com/teaminkling/mac-spotify-np/issues/new";

/**
 * The width of the main mini-player window in pixels.
 */
export const MAIN_WINDOW_WIDTH: number = 250;

/**
 * The height of the main mini-player window in pixels.
 */
export const MAIN_WINDOW_HEIGHT: number = 150;

/**
 * The longest a song title can be.
 */
export const SONG_TITLE_MAX_LENGTH: number = 25;

export const UPDATE_PERIOD: number = 750;
