process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.NODE_ENV = 'test';

require('./unit/models/User.test.js').run();
require('./unit/models/Streets.test.js').run();
require('./unit/controllers/UserController.test.js').run();
require('./unit/controllers/LoginController.test.js').run();
require('./unit/controllers/BidsController.test.js').run();