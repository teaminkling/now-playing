/**
 * Create safe bidirectional synchronous bridge across isolated contexts.
 *
 * Please read the [documentation](https://www.electronjs.org/docs/latest/api/context-bridge) for more information.
 * It is not likely that this file will need to be modified for regular development.
 */

import {contextBridge, ipcRenderer, IpcRendererEvent} from "electron";

// This API is available via `window[apiKey]` in the renderer.

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    /**
     * Send an asynchronous message to the main process.
     *
     * @param {string} channel the channel via which a message is sent to the main process
     * @param {unknown[]} args arguments to be provided in the message
     */
    sendMessage(channel: string, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },

    /**
     * Listen to a channel.
     *
     * @param {string} channel the channel to listen to
     * @param {CallableFunction} listener the listener function to be called on a channel message
     * @returns {CallableFunction} the listener removal callable
     */
    on(channel: string, listener: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => listener(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },

    /**
     * Add a one-time listener to a channel.
     *
     * Once a message is sent to that channel, the listener is removed.
     *
     * @param {string} channel the channel to listen to
     * @param {CallableFunction} listener the listener function to be called on a channel message
     */
    once(channel: string, listener: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event: IpcRendererEvent, ...args: unknown[]) => listener(...args));
    },
  },
});
