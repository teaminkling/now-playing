"use strict";

const {ipcMain} = require("electron");
const localStorage = require("../data/local");
const spotifyDataSource = require("../data/playback");
const mappers = require("../helpers/mappers");
const errorReporter = require("../helpers/error-reporter");
const authorizer = require("../data/authorization");
const {SONG_TITLE_MAX_LENGTH, UPDATE_PERIOD} = require("../helpers/constants");
const notifier = require("node-notifier");
const {authenticate} = require("../data/authorization");

ipcMain.on("shuffleButtonClicked", () => spotifyDataSource.shuffle(localStorage.get("accessToken"), true));
ipcMain.on("unshuffleButtonClicked", () => spotifyDataSource.shuffle(localStorage.get("accessToken"), false));
ipcMain.on("previousButtonClicked", () => spotifyDataSource.previousTrack(localStorage.get("accessToken")));
ipcMain.on("nextButtonClicked", () => spotifyDataSource.nextTrack(localStorage.get("accessToken")));
ipcMain.on("pauseButtonClicked", () => spotifyDataSource.pause(localStorage.get("accessToken")));
ipcMain.on("playButtonClicked", () => spotifyDataSource.play(localStorage.get("accessToken")));
ipcMain.on("addToLibraryClicked", (event, uri) => {
  const accessToken = localStorage.get("accessToken");
  spotifyDataSource.addTrackToLibrary(accessToken, uri);
});

let currentPlaybackURI;

exports.execute = function (parentWindow, tray) {
  ipcMain.on("addToPlaylistButtonClicked", handleAddToPlaylistButtonClicked);
  ipcMain.on("playlistSelected", (event, data) => handlePlaylistSelected(data));

  // Spotify does not provide websocket support for song status; we must do frequent-polling.

  setInterval(() => {
    // Don't bother to get the track if we've got no hope of being logged in.

    if (localStorage.get("userUri")) {
      getCurrentPlayback();
    } else if (parentWindow !== undefined) {
      // Change the renderer to show the login prompt rather than a loading symbol.

      sendToRendererProcess("login", {});
    }
  }, UPDATE_PERIOD);

  function getCurrentPlayback() {
    // Use the Spotify API auth information to try to get the current playback.

    const accessToken = localStorage.get("accessToken");

    spotifyDataSource.getCurrentPlayback(accessToken)
      .then(json => {
        if (json.item) {
          const mappedData = mappers.currentPlaybackToView(json);
          if (shouldShowTrackNotification(mappedData)) {
            notifier.notify(
              mappers.notificationData(mappedData), function (error, response, metadata) {
                const keyExists = Object.prototype.hasOwnProperty.call(metadata, "activationType");
                if (keyExists && metadata["activationType"] === "actionClicked") {
                  spotifyDataSource.nextTrack(localStorage.get("accessToken")).then();
                }
              }
            );
          }

          if (shouldShowSongMenubar()) {
            // Note: album name is not included in the tray song display as it is not likely wanted at a glance.

            const title = `${mappedData.artistName} - ${mappedData.musicName}`;

            if (title.length <= SONG_TITLE_MAX_LENGTH) {
              tray.setTitle("  " + title);
            } else {
              // Handle overflow of the title.

              tray.setTitle(
                "  " + title.substring(0, (SONG_TITLE_MAX_LENGTH - 1)) + "..."
              );
            }
          }

          currentPlaybackURI = mappedData.uri;

          sendToRendererProcess("currentPlaybackReceived", mappedData);
        } else {
          sendToRendererProcess("loading", {});

          // Attempt to use a refresh token to login. If that doesn't work, an auth force might be required.

          authenticate();
        }
      })
      .catch(error => {
        errorReporter.emit("getCurrentPlayback", error, true);

        sendToRendererProcess("noContent");
      });
  }

  function sendToRendererProcess(channel, data) {
    parentWindow.webContents.send(channel, data);
  }

  function didSongChange(data) {
    return data.uri !== currentPlaybackURI;
  }

  function shouldShowTrackNotification(data) {
    return data.currentlyPlayingType === "track" && didSongChange(data) && localStorage.get("activateNotifications");
  }

  function shouldShowSongMenubar() {
    return localStorage.get("songMenubar") && localStorage.get("accessToken");
  }

  function handleAddToPlaylistButtonClicked() {
    const accessToken = localStorage.get("accessToken");
    spotifyDataSource.getPlaylists(accessToken)
      .then(data => {
        const mappedData = mappers.playlistsToView(data);
        sendToRendererProcess("playlistsReceived", mappedData);
      })
      .catch(error => errorReporter.emit("getPlaylists", error, true));
  }

  function handlePlaylistSelected(data) {
    const accessToken = localStorage.get("accessToken");
    const {playlistId, uri} = data;
    spotifyDataSource.addTrackToPlaylist(accessToken, playlistId, uri)
      .then(response => response.error ? authorizer.execute(parentWindow) : sendToRendererProcess("trackAdded"))
      .catch(error => errorReporter.emit("addTrackToPlaylist", error, true));
  }
};
