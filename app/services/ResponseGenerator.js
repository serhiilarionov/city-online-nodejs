'use strict';
var environment = process.env.NODE_ENV;

/**
 * ResponseGenerator создает по внутрисистемному коду ошибки, соответствующий объект ответа
 *                    для последующей его отправки в ответе на запрос клиента.
 * @param eventExplain - объект описания события
 * @param error - объект ошибки (передается клиенту только в случае выставленного в NODE_ENV режима разработки)
 * @param validationErrors - в случае ошибок валидации содержит текст ошибок валидации
 */
module.exports = function (eventExplain, error, validationErrors, payload) {
  var response = {
    status_code: eventExplain.code,
    message: eventExplain.message || ''
  };

  if(environment === 'development') {
    response.error = error;
  }

  if(validationErrors) {
    response.validation_errors = validationErrors;
  }
  if(eventExplain.code >= 4000){
    var errorObj = {
      status_code:eventExplain.code
    };
    if(error){
      errorObj.error = error
    }
    if(validationErrors){
      errorObj.validationErrors = validationErrors
    }
  }
  if(payload) {
    response.payload = payload;
  }
  return response;
};