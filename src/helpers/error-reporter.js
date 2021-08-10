'use strict';

const isProduction = require('electron').app.isPackaged;
const { ERROR_MESSAGES } = require('../helpers/constants');

exports.emit = function(errorMessageKey, error) {
  const event = {
    message: ERROR_MESSAGES[errorMessageKey] || errorMessageKey,
    extra: { error }
  };

  if (!isProduction) {
    console.log(event);
  }
};
