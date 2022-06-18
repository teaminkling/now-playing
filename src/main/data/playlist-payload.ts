export interface PlaylistPayload {
  id: string;
  name: string;
}

export default interface PlaylistsPayload {
  playlists: PlaylistPayload[];
}
