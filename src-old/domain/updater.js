"use strict";

const fetch = require("electron-fetch").default;
const semver = require("semver");

const { app, ipcMain } = require("electron");

const windowFactory = require("../helpers/window-factory");
const errorReporter = require("../helpers/error-reporter");

let updateWindow;
let dmgDownloadUrl;

ipcMain.on("downloadUpdateButtonClicked", () => updateWindow.webContents.downloadURL(dmgDownloadUrl));
ipcMain.on("cancelUpdateButtonClicked", () => updateWindow.close());

function isAppUpdated(versionFromGithub) {
  return semver.gte(app.getVersion(), versionFromGithub.replace("v", ""));
}

function createUpdateWindow(parentWindow) {
  updateWindow = windowFactory.get("updater", { parentWindow });
  updateWindow.loadFile("src/presentation/html/update.html");
}

function setListenersToUpdateWindow() {
  updateWindow.on("closed", () => updateWindow = null);
  updateWindow.webContents.session.on("will-download", (event, item) => {
    item.setSavePath(`${app.getPath("downloads")}/${item.getFilename()}`);
    item.on("updated", () => updateWindow.webContents.send("downloadStarted"));
    item.once("done", (event, state) => {
      if (state === "completed") {
        if (updateWindow) updateWindow.webContents.send("downloadCompleted");
      } else {
        errorReporter.emit("downloadAppLatestVersion", state);
      }
    });
  });
}

/**
 * @returns string the latest version of the app
 */
function getLatestVersion() {
  return fetch("https://api.github.com/repos/teaminkling/mac-spotify-np/releases/latest", {
    method: "GET",
    headers: { "Accept": "application/vnd.github.v3+json" }
  }).then(response => response.json()).then(response => ({
    version: response.name,
    dmgDownloadUrl: response["assets"][0]["browser_download_url"],
  }));
}

exports.execute = function(parentWindow) {
  getLatestVersion().then(data => {
    if (!isAppUpdated(data.version)) {
      dmgDownloadUrl = data.dmgDownloadUrl;

      if (!updateWindow) {
        createUpdateWindow(parentWindow);
        setListenersToUpdateWindow();
      }
    }
  }).catch(error => errorReporter.emit("getAppLatestVersion", error));
};
