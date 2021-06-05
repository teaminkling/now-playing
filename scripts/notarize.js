const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    throw "Can't sign on non-macOS platforms!";
  }

  const appName = context.packager.appInfo.productFilename;

  console.log(context);

  throw "Fuck";

  return await notarize({
    appBundleId: 'com.teaminkling.now-playing-for-spotify',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
  });
};
