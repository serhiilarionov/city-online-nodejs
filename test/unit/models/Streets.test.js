var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var Streets = require('../../../app/models/Streets.js');
var testingData = require('../testingData/testingData.js');
var config = require('../../../config/config.js');

var existentLogin = testingData.existentLogin;
var someLogin = testingData.nonexistentLogin;
var newLogin = testingData.newUserInfo.userLogin;
var realName = testingData.newUserInfo.userRealname;
var email = testingData.newUserInfo.userEmail;
var pass =  testingData.newUserInfo.userPassword;

exports.run = function() {
  describe("Streets model", function () {
    describe("Get streets list", function () {
      it("Should return streets list", function (done) {
        Streets.getStreets(config.db)
          .then(function (res) {
            res.should.be.an('array');
            res[0].should.contain.keys("ID", "Name");
            done();
          })
          .catch(function (err) {
            console.log(err);
          })
      })
    });
  });
};
