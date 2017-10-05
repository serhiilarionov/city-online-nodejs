var chai = require('chai')
  , expect = chai.expect
  , should = chai.should();
var request = require('superagent');
var User = require('../../../app/models/User.js');
var testingData = require('../testingData/testingData.js');

exports.run = function() {
  var server,
    context;

  describe('UserController', function () {
    before(function(done) {
      server = require('../../../testserver.js');
      context = server.init().getContext();
      done();
    });

    after(function(done){
      context.server.close();
      setTimeout(done, 500);
    });

    describe("Processing user registration", function () {
      var testLogin;
      after(function(done){
        request
          .del(testingData.url + '/deluser/'+ testLogin)
          .end(function(err, res){
            if (err) {
              console.log(err);
            }
            res.status.should.be.equal(200);
            done();
          })
      });

      it("Should return user data generated for registration", function (done) {
        request
          .post(testingData.url + '/adduser')
          .send(testingData.newUserInfo)
          .accept('json')
          .end(function (err, res) {
            if (err) {
              console.log(err);
            }
            testLogin = testingData.newUserInfo.userLogin;
            res.status.should.be.equal(200);
            expect(res.text).should.be.a('Object');
            done();
          });
      });

      it("Should return status 404 - user has not been registered", function(done){
        request
          .post(testingData.url + '/adduser')
          .send({
            userLogin: 'admin1',
            userRealname:'admin1',
            userEmail:'admin_1999@mail.ru',
            userPassword: '123456',
            rePass: '12345'
          })
          .accept('json')
          .end(function(err, res){
            res.status.should.be.equal(404);
            done();
          })
      });

      it("Should return status 404 - incorrect email", function(done){
        request
          .post(testingData.url + '/adduser')
          .send({
            userLogin: 'admin1',
            userRealname:'admin1',
            userEmail:'admin1999mailru',
            userPassword: '123456',
            rePass: '123456'
          })
          .accept('json')
          .end(function(err, res){
            res.status.should.be.equal(404);
            done();
          })
      });

      it("Should return status 404 - request has empty fields", function(done){
        request
          .post(testingData.url + '/adduser')
          .send({
            userLogin: '',
            userRealname:'admin1',
            userEmail:'admin1999mailru',
            userPassword: '123456',
            rePass: '123456'
          })
          .accept('json')
          .end(function(err, res){
            res.status.should.be.equal(404);
            done();
          })
      });

      it("Should return status 400 - user exists", function(done){
        request
          .post(testingData.url + '/adduser')
          .send({
            userLogin: 'admin1',
            userRealname:'admin1',
            userEmail:'admin1999@mail.ru',
            userPassword: '123456',
            rePass: '123456'
          })
          .accept('json')
          .end(function(err, res){
            res.status.should.be.equal(400);
            done();
          })
      });
    });
  });
};


