/**
 * This file manages the local data system for the application.
 */

"use strict";

const { app } = require("electron");

// Load the configuration file once on runtime:

const nconf = require("nconf").file({ file: getPath() + "/local-storage.json" });

/**
 * Save a key-value pair to local storage.
 *
 * @param key the key to save
 * @param value the value to save
 */
exports.save = function (key, value) {
  nconf.set(key, value);

  nconf.save();
};

/**
 * Get a value from local storage via the provided key.
 *
 * @param key the key to query
 * @returns any the value, if found
 */
exports.get = function (key) {
  nconf.load();

  return nconf.get(key);
};

/**
 * @returns string the user data path
 */
function getPath() {
  return app.getPath("userData");
}
