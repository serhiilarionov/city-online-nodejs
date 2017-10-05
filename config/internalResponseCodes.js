'use strict';

/**
 * Внутрисистемные коды ошибок с описанием
 */
module.exports = {
  //  Info
  OK: {
    code: 2000,
    message: 'OK'
  },
  EMAIL_SENDED: {
    code: 2001,
    message: 'Email sended'
  },
  SUCCESSFUL_AUTHENTICATION: {
    code: 2002,
    message: 'Authentication is successful'
  },
  PASSWORD_CHANGED: {
    code: 2003,
    message: 'Password changed'
  },
  BID_ADDED: {
    code: 2004,
    message: 'Bid is added'
  },
  BID_DELETED: {
    code: 2005,
    message: 'Bid is deleted'
  },

  //  Bad requests
  BAD_REQUEST: {
    code: 4000,
    message: 'Bad request'
  },
  INVALID_EMAIL: {
    code: 4001,
    message: 'Email should look like example@example.com'
  },
  INVALID_LOGIN_PASS: {
    code: 4002,
    message: 'Invalid login or password'
  },
  USER_NOT_FOUND: {
    code: 4003,
    message: 'User with this email was not found'
  },
  STREET_NOT_FOUND: {
    code: 4004,
    message: 'Unable to find street'
  },
  USER_ALREADY_EXISTS: {
    code: 4005,
    message: 'User already exists'
  },
  PASSWORDS_DO_NOT_MATCH: {
    code: 4006,
    message: 'Passwords do not match'
  },
  ALL_FIELDS_ARE_REQUIRED: {
    code: 4007,
    message: 'All fields are required'
  },
  REGISTRATION_SUCCESSFUL: {
    code: 4008,
    message: 'Registration successful'
  },
  WRONG_USER_ADDRESS: {
    code: 4009,
    message: 'Wrong user address'
  },
  EMPTY_BID: {
    code: 4010,
    message: 'Empty bid message, category or subcategory'
  },
  NOT_FOUND_LOGIN_PASS: {
    code: 4011,
    message: 'You have not entered the username or the password'
  },

  //  Errors
  INTERNAL_SERVER_ERROR: {
    code: 5000,
    message: 'Internal server error'
  },
  PASSWORDS_NOT_MATCH: {
    code: 5001,
    message: 'The passwords do not match'
  },
  IMAGE_ERROR: {
    code: 5003,
    message: 'There was an error loading the image'
  },
  ADD_BID_ERROR: {
    code: 5004,
    message: 'An error occurred while adding bid'
  },
  WRONG_ADDRESS: {
    code: 5005,
    message: 'Wrong address'
  },
  DETERMINING_USER_ERROR: {
    code: 5006,
    message: 'An error occurred while user determining'
  }
};