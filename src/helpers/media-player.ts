// noinspection NestedFunctionJS

import { BrowserWindow, ipcMain, IpcMainEvent, Tray } from 'electron';

import { get } from '../data/local-storage';

import {
  addTrackToLibrary,
  addTrackToPlaylist,
  getCurrentPlayback,
  getPlaylists,
  nextTrack,
  pause,
  play,
  previousTrack,
  shuffle
} from '../data/spotify-api';

import { SONG_TITLE_MAX_LENGTH, UPDATE_PERIOD } from '../constants';

import { NotificationCenter, NotificationMetadata } from 'node-notifier';
import { handleAuthentication } from "./authentication";

ipcMain.on('shuffleButtonClicked', () => shuffle(get('accessToken'), true));
ipcMain.on('unshuffleButtonClicked', () => shuffle(get('accessToken'), false));
ipcMain.on('previousButtonClicked', () => previousTrack(get('accessToken')));
ipcMain.on('nextButtonClicked', () => nextTrack(get('accessToken')));
ipcMain.on('pauseButtonClicked', () => pause(get('accessToken')));
ipcMain.on('playButtonClicked', () => play(get('accessToken')));
ipcMain.on('addToLibraryClicked', (_event: IpcMainEvent, uri) => {
  addTrackToLibrary(get('accessToken'), uri).then(null);
});

const notifier = new NotificationCenter({withFallback: true});

let currentPlaybackURI: string;

export function handleMediaPlayback(parentWindow: BrowserWindow, tray: Tray) {
  ipcMain.on('addToPlaylistButtonClicked', handleAddToPlaylistButtonClicked);
  ipcMain.on('playlistSelected', (_event, data) => handlePlaylistSelected(data));

  setInterval(() => retrieveCurrentPlayback(), UPDATE_PERIOD);

  let index = 0;

  function retrieveCurrentPlayback() {
    const accessToken: string = localStorage.get('accessToken');

    getCurrentPlayback(accessToken)
        .then(json => {
          if (json.item) {
            const mappedData = currentPlaybackToView(json);
            if (shouldShowTrackNotification(mappedData)) {
              notifier.notify(
                  {
                    title: mappedData.musicName,
                    subtitle: mappedData.artistName,
                    message: mappedData.albumName,
                    contentImage: mappedData.albumImageSrc,
                    timeout: 5,
                    actions: 'Next Song'
                  },
                  (
                      _error: Error | null,
                      _response: string,
                      metadata: NotificationMetadata | undefined
                  ) => {
                    const keyExists: boolean = Object.prototype.hasOwnProperty.call(
                        metadata, 'activationType'
                    );

                    if (keyExists && metadata!['activationType'] === 'actionClicked') {
                      nextTrack(localStorage.get('accessToken')).then(null);
                    }
                  }
              );
            }
            if (shouldShowSongMenubar()) {
              const title = `${mappedData.artistName} - ${mappedData.musicName} - ${mappedData.albumName}`;

              if (title.length <= SONG_TITLE_MAX_LENGTH) {
                tray.setTitle(title);
              } else {
                if (didSongChange(mappedData)) {
                  index = 0;
                }

                tray.setTitle(title.substring(index, index + (SONG_TITLE_MAX_LENGTH - 1)));
                index = (index + 1) % (title.length - SONG_TITLE_MAX_LENGTH + 2);
              }
            }
            currentPlaybackURI = mappedData.uri;
            sendToRendererProcess('currentPlaybackReceived', mappedData);
          } else {
            sendToRendererProcess('loading', {});

            handleAuthentication(parentWindow);
          }
        })
        .catch((_error: any) => {
          sendToRendererProcess('noContent', {});
        });
  }

  function sendToRendererProcess(channel: string, data: any) {
    parentWindow.webContents.send(channel, data);
  }

  function didSongChange(data: any) {
    return data.uri !== currentPlaybackURI;
  }

  function shouldShowTrackNotification(data: any) {
    return data.currentlyPlayingType === 'track' && didSongChange(data) && get('activateNotifications');
  }

  function shouldShowSongMenubar() {
    return get('songMenubar');
  }

  function handleAddToPlaylistButtonClicked() {
    const accessToken = get('accessToken');
    getPlaylists(accessToken)
        .then((data: any) => {
          const mappedData = playlistsToView(data);
          sendToRendererProcess('playlistsReceived', mappedData);
        });
  }

  function handlePlaylistSelected(data: any) {
    const accessToken = get('accessToken');
    const {playlistId, uri} = data;
    addTrackToPlaylist(accessToken, playlistId, uri)
        .then(response => {
          response.error ? handleAuthentication(parentWindow) : sendToRendererProcess('trackAdded', {});
        });
  }
}

function currentPlaybackToView(data: any) {
  const albumImage = data.item.album.images[0];
  const albumImageSrc = albumImage ? albumImage.url : '';
  const artistName = data.item.artists.map((artist: any) => artist.name).join(', ');

  return {
    albumImageSrc,
    albumName: data.item.album.name,
    artistName,
    musicName: data.item.name,
    musicDuration: data.item.duration_ms,
    currentProgress: data.progress_ms,
    isPlaying: data.is_playing,
    shuffleState: data.shuffle_state,
    currentlyPlayingType: data.currently_playing_type,
    uri: data.item.uri
  };
}

function playlistsToView(data: any) {
  if (!Array.isArray(data)) {
    return;
  }

  return data.map(item => ({
    name: item.name,
    id: item.id
  }));
}
