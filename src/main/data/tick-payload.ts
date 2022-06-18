/**
 * A request sent on every tick while authenticated.
 *
 * ## Notes
 *
 * All of these are needed since it is possible to update all of this information on another device.
 */
export default interface TickPayload {
  /**
   * The current number of milliseconds through the current song.
   */
  progressMs: number;

  /**
   * Whether a song is still playing.
   */
  isPlaying: boolean;

  /**
   * The shuffle state.
   */
  shuffleState: boolean;
}
