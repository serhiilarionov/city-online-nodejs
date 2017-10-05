var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var User = require('../../../app/models/User.js');
var testingData = require('../testingData/testingData.js');

var existentLogin = testingData.existentLogin;
var someLogin = testingData.nonexistentLogin;
var newLogin = testingData.newUserInfo.userLogin;
var realName = testingData.newUserInfo.userRealname;
var email = testingData.newUserInfo.userEmail;
var pass =  testingData.newUserInfo.userPassword;

exports.run = function() {
  describe("UserModel", function () {
    describe("Get an user by existent login", function () {
      it("Should return true if user exist", function (done) {
        User.checkIfUserExists(existentLogin).should.eventually.be.equal(true).notify(done);
      })
    });

    describe("Add an user to the table", function () {
      it.skip('should add new user without any errors', function (done) {
        User.addNewUser(newLogin, realName, email, pass).should.eventually.be.fulfilled.notify(done);
      })
    });
  });
};
