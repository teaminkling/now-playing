const {notarize} = require('electron-notarize');
const path = require("path");

// Load environment variables.

require("dotenv").config({
  path: path.resolve(process.cwd(), "notarize.env"),
});

/**
 * Notarise a macOS application.
 *
 * To run this, environment variables must exist for APPLE_ID and APPLE_ID_PASSWORD.
 *
 * @param context the pipeline context from the electron-builder process
 * @returns {Promise<void>} the promise for notarisation
 */
exports.default = async context => {
  const {electronPlatformName, appOutDir} = context;
  if (electronPlatformName !== "darwin") {
    throw Error("Can't sign on non-macOS platforms!");
  }

  const appName = context.packager.appInfo.productFilename;
  const appBundleId = context.packager.appInfo.info._configuration.appId;
  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_ID_PASSWORD;

  if (!appleId || !appleIdPassword) {
    throw Error("You must have APPLE_ID and APPLE_ID_PASSWORD set to notarize this application.");
  }

  return notarize({
    appBundleId: appBundleId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: appleId,
    appleIdPassword: appleIdPassword,
  });
};
