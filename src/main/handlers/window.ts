import {BrowserWindow} from "electron";
import {resolveHtmlPath} from "../utils";

/**
 * Launch the main window.
 *
 * @param {Electron.CrossProcessExports.BrowserWindow} mainWindow the window reference
 */
export const launchMainWindow = async (mainWindow: BrowserWindow) => {
  mainWindow.loadURL(resolveHtmlPath("index.html")).then();
  mainWindow.setVisibleOnAllWorkspaces(true, {"visibleOnFullScreen": true});
  mainWindow.on("blur", () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });
};
