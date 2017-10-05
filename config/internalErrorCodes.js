'use strict';

/**
 * Внутрисистемные коды ошибок с описанием
 */
module.exports = {
  NO_MORE_FIREBIRD_CONNECTIONS_LEFT: {
    code: 1,
    message: 'No more connections to firebird left'
  },
  NOTHING_TO_DO_CALL_INIT_FIRSTLY: {
    code: 1,
    message: 'There is no connection to use, call reserve firstly'
  }
};