/**
 * Accessors and mutators for local storage configuration.
 */

import { app } from 'electron';

import { file } from 'nconf';

const nconf = file({ file: `${app.getPath('userData')}/local-storage.json` });

/**
 * Mutate a variable in local storage.
 *
 * @param key the key
 * @param value the value
 */
export function set(key: string, value: any): void {
  nconf.set(key, value);

  nconf.save(null);
}

/**
 *
 * Access a variable in local storage.
 *
 * @param key the key
 */
export function get(key: string): any {
  nconf.load();

  return nconf.get(key);
}
