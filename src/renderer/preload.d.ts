// Allow accessing `Window.electron` elsewhere in TypeScript code and provide interface definition for it.

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: string, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
