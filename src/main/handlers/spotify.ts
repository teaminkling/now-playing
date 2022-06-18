import {ipcMain} from "electron";
import SpotifyWebApi from "spotify-web-api-node";
import {UPDATE_PERIOD} from "../../constants";
import {SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI} from "../../secrets";
import AddToLibraryRequest from "../data/add-to-library-request";
import AddToPlaylistRequest from "../data/add-to-playlist-request";
import PlaylistsPayload from "../data/playlist-payload";
import SongPayload from "../data/song-payload";
import TickPayload from "../data/tick-payload";
import {NowPlayingStoreKey, store} from "../services/store";
import BrowserWindow = Electron.BrowserWindow;

/**
 * The total number of playlists supported.
 */
const PLAYLIST_LIMIT = 50;

/**
 * The song that is currently being played. Used to determine if a song has changed for notifications.
 */
let currentPlaybackUri = "";

/**
 * The in-memory playback state.
 *
 * ## Notes
 *
 * This may not actually be accurate due to a user possibly having multiple devices.
 */
let isPlayingState = false;

/**
 * The in-memory shuffle state.
 *
 * ## Notes
 *
 * This may not actually be accurate due to a user possibly having multiple devices.
 */
let isShuffleState = false;

/**
 * The Spotify API object.
 *
 * ## Warning
 *
 * This is a stateful wrapper. Keep in mind that some endpoints will require an access token or a redirect token
 * which must be provided to the API explicitly, and changed when necessary.
 *
 * State is reset when closing the application and therefore needs to be written to local storage as well as in memory.
 */
export const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID, clientSecret: SPOTIFY_CLIENT_SECRET, redirectUri: SPOTIFY_REDIRECT_URI,
});

/**
 * Populate the Spotify API client's user-specific tokens on re-launch.
 *
 * @returns {boolean} whether the persistent values set the in-memory tokens
 */
export const refreshPersistentCredentials = async (): Promise<boolean> => {
  const accessToken: string | undefined = store.get(NowPlayingStoreKey.ACCESS_TOKEN);
  const refreshToken: string | undefined = store.get(NowPlayingStoreKey.REFRESH_TOKEN);

  if (accessToken && refreshToken) {
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    return true;
  }

  return false;
};

/**
 * Activate frequent polling for the current song.
 *
 * ## Notes
 *
 * The reason this is necessary is that Spotify does not yet provide WebSocket support. Frequent polling mostly
 * affects Spotify, but it also affects the battery life of Now Playing users.
 *
 * Unfortunately, there's nothing we can do about this for now until such an API change is made.
 *
 * @param {BrowserWindow} mainWindow the window used to send messages to the renderer
 */
export const activateFrequentPolling = (mainWindow: BrowserWindow) => {
  // Playlists retrieval needs to send messages to the receiver.

  ipcMain.on("update-playlist-list", () => {
    spotifyApi.getUserPlaylists({limit: PLAYLIST_LIMIT}).then(response => {
      const body: SpotifyApi.ListOfUsersPlaylistsResponse = response.body;

      mainWindow.webContents.send("update-playlist-list", createPlaylistsPayload(body));
    });
  });

  setInterval(() => {
    if (store.get(NowPlayingStoreKey.USER_ID)) {
      updateNowPlaying(mainWindow);
    }
  }, UPDATE_PERIOD);
};

/**
 * Ensure the "now playing" is accurate by updating the playback time.
 *
 * If the song has changed since the last song, send a message to the renderer and, if enabled, send a notification.
 *
 * ## Notes
 *
 * While a large payload is sent when a song changes, including an "is local" variable, those variables may not be
 * utilised on the renderer.
 *
 * @param {BrowserWindow} mainWindow the window used to send messages to the renderer
 */
const updateNowPlaying = (mainWindow: BrowserWindow) => {
  spotifyApi.getMyCurrentPlaybackState().then(request => {
    const playbackResponse: SpotifyApi.CurrentPlaybackResponse = request.body;
    if (!playbackResponse.item) {
      return;
    }

    mainWindow.webContents.send("update-playback-progress", createTickPayload(playbackResponse));
    if (playbackResponse.item.uri !== currentPlaybackUri) {
      const payload: SongPayload | null = createPlaybackPayload(playbackResponse);
      if (payload) {
        mainWindow.webContents.send("update-playback-item", payload);
      }

      mainWindow.webContents.send("update-playback-progress", createTickPayload(playbackResponse));
    }
  }).catch(error => {
    console.error(error);

    // Handle reauth.
  });
};

const createPlaylistsPayload = (requestBody: SpotifyApi.ListOfUsersPlaylistsResponse): PlaylistsPayload => {
  // FIXME: This needs to comb through playlists and only include collaborative and self-owned playlists.

  return {
    playlists: requestBody.items.map(
      item => {
        return {id: item.id, name: item.name,};
      }
    ),
  };
};

/**
 * Create a payload to be sent to the renderer every tick.
 *
 * ## Notes
 *
 * If there's no song playing, it is possible that updates to the shuffle state etc. might not be updated correctly.
 * This needs to be reflected accurately on the renderer.
 *
 * @param {SpotifyApi.CurrentPlaybackResponse} playbackResponse the current playback state response from the API
 * @returns {TickPayload} the payload regardless of if there's a song playing
 */
const createTickPayload = (playbackResponse: SpotifyApi.CurrentPlaybackResponse): TickPayload => {
  return {
    progressMs: playbackResponse.progress_ms || 0,
    isPlaying: playbackResponse.is_playing,
    shuffleState: playbackResponse.shuffle_state,
  };
};

/**
 * Create a payload to be sent to the renderer on song change.
 *
 * ## Caveats
 *
 * We do not fully support podcast episodes yet. Private mode is also not supported, but that's due to the Spotify
 * API and can't be fixed on our end. Also, we don't fully support sending a message on ads or local songs.
 *
 * @param {SpotifyApi.CurrentPlaybackResponse} playbackResponse the current playback state response from the API
 * @returns {null | SongPayload} the payload, if there's a current non-private song playing
 */
const createPlaybackPayload = (playbackResponse: SpotifyApi.CurrentPlaybackResponse) => {
  const item: SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObject | null = playbackResponse.item;
  if (item === null) {
    return null;
  }

  const commonParts = {
    uri: item.uri, track: item.name, type: playbackResponse.currently_playing_type, totalMs: item.duration_ms,
  };

  let payload: SongPayload;
  currentPlaybackUri = item.uri;
  if (item.type === "track") {
    const artist: string = item.artists.map(artist => artist.name).join(", ");
    payload = {
      ...commonParts,
      artist: artist,
      album: item.album.name,
      albumType: item.album.album_type,
      isLocal: item.is_local || false,
    };
  } else if (item.type === "episode") {
    payload = {
      ...commonParts, artist: item.show.name, album: "Podcast", isLocal: false,
    };
  } else {
    throw new Error(`Playback type not understood on item: [${item}].`);
  }

  return payload;
};

// Start defining main thread Spotify-specific listeners.

ipcMain.on("toggle-shuffle", () => {
  spotifyApi.setShuffle(!isShuffleState).then(() => {
    isShuffleState = !isShuffleState;
  }).catch(console.error);
});

ipcMain.on("previous", () => {
  spotifyApi.skipToPrevious().catch(console.error);
});

ipcMain.on("next", () => {
  spotifyApi.skipToNext().catch(console.error);
});

ipcMain.on("toggle-play", () => {
  const toggleCallback = () => {
    isPlayingState = !isPlayingState;
  };

  try {
    if (isPlayingState) {
      spotifyApi.pause({}, toggleCallback);
    } else {
      spotifyApi.play({}, toggleCallback);
    }
  } catch (error) {
    console.error(error);
  }
});

ipcMain.on("add-to-library", (_event, data: AddToLibraryRequest) => {
  spotifyApi.addToMySavedTracks([data.trackId]).catch(console.error);
});

ipcMain.on("add-to-playlist", (_event, data: AddToPlaylistRequest) => {
  spotifyApi.addTracksToPlaylist(data.playlistId, [data.trackId]).catch(console.error);
});
