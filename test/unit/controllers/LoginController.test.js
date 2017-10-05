var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();
var request = require('superagent');
var User = require('../../../app/models/User.js');

var testingData = require('../testingData/testingData.js');
var token = '';

exports.run = function(){
  var server,
    context;

  describe("LoginController", function(){
    before(function(done) {
      server = require('../../../testserver.js');
      context = server.init().getContext();
      done();
    });

    after(function(done){
      context.server.close();
      setTimeout(done, 500);
    });

    describe("User authentication", function(){

      before(function(done){
        request
          .post(testingData.url + '/login')
          .send({userLogin: 'admin1', userPassword: '123456'})
          .accept('json')
          .end( function(err, res){
            if(err){
              console.log(err);
            }
            res.status.should.be.equal(200);
            res.body.should.have.property('message').be.equal('Authentication is successful');
            res.body.should.have.property('payload').have.property('token').to.be.a('string');
            token = res.body.payload.token;
            console.log('before');
            done();
          });
      });

      after(function(done){
        request
          .get(testingData.url + '/logout')
          .end(function(err, res){

            if(err){
              console.log(err);
            }
            //res.location.should.be.equal('/');
            res.status.should.be.equal(200);
            console.log('after');
            done();
          });
      });

      it("Should return status 401 - user not authenticated", function(done){
        request
          .post(testingData.url + '/login')
          .send({userLogin: 'admin1', userPassword: '12345'})
          .accept('json')
          .end( function(err, res){
            res.status.should.be.equal(401);
            done();
          })
      });

      it("Should return status 400 - request has empty fields", function(done){
        request
          .post(testingData.url + '/login')
          .send({userLogin: '', userPassword: '12345'})
          .accept('json')
          .end( function(err, res){
            res.status.should.be.equal(400);
            done();
          })
      });

      it("Should return status 200 and redirect to / ", function(done){
        request
          .get(testingData.url + '/logout')
          .end(function(err, res){
            if(err){
              console.log(err);
            }
            res.status.should.be.equal(200);
            done();
          });
      });
    });

    describe.skip("Recover user password", function(){

      var testLogin;

      before(function(done){
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
            done();
          });
      });

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

      it('Should return status 200 - email has sent', function(done){
        request
          .post(testingData.url + '/forgot')
          .send({
            userEmail: testingData.newUserInfo.userEmail
          })
          .end(function(err, res){
            recHash = res.body;
            res.status.should.be.equal(200);
            done();
          });
      });

      it('Should return status 200 - hashes are equal', function(done){
        request
          .post(testingData.url + '/forgot')
          .send({
            userEmail: testingData.newUserInfo.userEmail
          })
          .end(function(err, res){
            recHash = res.body;
            res.status.should.be.equal(200);
            request
              .get(testingData.url + '/forgot/' + recHash)
              .end(function(err, res){
                res.status.should.be.equal(200); //Is it correct? we do not set a new password!
                done();
              })
          });
      });

      it('Should return status 404 - wrong hash', function(done){
        request
          .post(testingData.url + '/forgot')
          .send({
            userEmail: testingData.newUserInfo.userEmail
          })
          .end(function(err, res){
            recHash = res.body;
            res.status.should.be.equal(200);
            request
              .get(testingData.url + '/forgot/' + testingData.wrongHash)
              .end(function(err, res){
                res.status.should.be.equal(404);
                done();
              })
          });
      });

      it('Should return status 200 - password was changed', function(done){
        request
          .post(testingData.url + '/forgot')
          .send({
            userEmail: testingData.newUserInfo.userEmail
          })
          .end(function(err, res){
            recHash = res.body;
            res.status.should.be.equal(200);
            request
              .get(testingData.url + '/forgot/' + recHash)
              .send({userPassword:'1111', rePass:'1111'})
              .end(function(err, res){
                res.status.should.be.equal(200);
                done();
              })
          });
      });

    });
  })
};