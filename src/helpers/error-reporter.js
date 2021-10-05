'use strict';

const isProduction = require('electron').app.isPackaged;
const { ERROR_MESSAGES } = require('../helpers/constants');
const { authenticate } = require('../data/authorization');

exports.emit = function(errorMessageKey, error, doReauthenticate = false) {
  const event = {
    message: ERROR_MESSAGES[errorMessageKey] || errorMessageKey,
    extra: { error }
  };

  // Log to console only if not in production.

  if (!isProduction) {
    console.log(event);
  }

  // Errors sometimes indicate a need to reauthenticate.

  if (doReauthenticate) {
    authenticate();
  }
};
