/**
 * The payload sent from the main thread to the renderer.
 */
export default interface SongPayload {
  uri: string;

  artist: string;

  album: string;

  /**
   * The type of album.
   */
  albumType?: string;

  /**
   * Whether this is a locally played file.
   */
  isLocal: boolean;

  track: string;

  /**
   * The kind of type according to the Spotify API.
   *
   * We may expect "ad", "episode", "track", or "unknown".
   */
  type: string;

  /**
   * The total number of milliseconds in the song.
   *
   * The current number of milliseconds is provided in a different channel call.
   */
  totalMs: number;
}
