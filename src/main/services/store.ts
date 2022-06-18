import Store from "electron-store";

enum NowPlayingStoreBoolKey {
  HAS_NOTIFICATIONS = "HAS_NOTIFICATIONS",
  HAS_SONG_IN_TRAY = "HAS_SONG_IN_TRAY",
}

enum NowPlayingStoreStringKey {
  USER_ID = "USER_ID",
  ACCESS_TOKEN = "ACCESS_TOKEN",
  REFRESH_TOKEN = "REFRESH_TOKEN",
  AUTHORIZED_SCOPES = "AUTHORIZED_SCOPES",
}

enum NowPlayingStoreNumberKey {}

/**
 * All keys in the data store.
 */
export const NowPlayingStoreKey = {
  ...NowPlayingStoreBoolKey, ...NowPlayingStoreStringKey, ...NowPlayingStoreNumberKey,
};

type NowPlayingBoolStore = { [key in NowPlayingStoreBoolKey]: boolean; };
type NowPlayingStringStore = { [key in NowPlayingStoreStringKey]: string; };
type NowPlayingNumberStore = { [key in NowPlayingStoreNumberKey]: number; };

/**
 * All keys and their value types in the data store.
 */
export interface NowPlayingStore extends NowPlayingBoolStore, NowPlayingStringStore, NowPlayingNumberStore {
  // Deliberately empty.
}

export const store = new Store<NowPlayingStore>();
