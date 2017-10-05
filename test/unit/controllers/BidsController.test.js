var chai = require('chai'),
  expect = chai.expect,
  should = chai.should();
var request = require('superagent');
var testingData = require('../testingData/testingData.js');
var token = '';

exports.run = function(){
  var server,
    context;

  describe("BidsController", function(){
    before(function(done) {
      server = require('../../../testserver.js');
      context = server.init().getContext();
      done();
    });

    after(function(done){
      context.server.close();
      setTimeout(done, 500);
    });

    describe("Add bid", function() {
      before(function (done) {
        request
          .post(testingData.url + '/login')
          .send({userLogin: 'user555', userPassword: '333'})
          .accept('json')
          .end(function (err, res) {
            if (err) {
              console.log(err);
            }
            res.status.should.be.equal(200);
            res.body.should.have.property('message').be.equal('Authentication is successful');
            res.body.should.have.property('payload').have.property('token').to.be.a('string');
            token = res.body.payload.token;
            done();
          });
      });

      after(function (done) {
        request
          .del(testingData.url + '/bid')
          .set('authorization', token)
          .set('token', token)
          .end(function (err, res) {
            if (err) {
              console.log(err);
            }
            res.status.should.be.equal(200);
            done();
          })
      });

      it("Should return status 200 - bid has been added", function (done) {
        request
          .post(testingData.url + '/bid/add')
          .set('authorization', token)
          .send(testingData.newBidData)
          .accept('json')
          .end(function (err, res) {
            if (err) {
              console.log(err);
            }
            res.status.should.be.equal(200);
            done();
          })
      });

      it("Should return status 200 - bid has been added On User Address", function (done) {
        request
          .post(testingData.url + '/bid/add')
          .set('authorization', token)
          .send(testingData.newBidDataOnUserAddress)
          .accept('json')
          .end(function (err, res) {
            if (err) {
              console.log(err);
            }
            res.status.should.be.equal(200);
            done();
          })
      });

      it('Should return status 404', function(done){
        request
          .post(testingData.url + '/bid/add')
          .set('authorization', token)
          .end(function(err, res){
            res.status.should.be.equal(404);
            done();
          })
      });
    });

    describe("Get bids", function(){
      before(function (done) {
        request
          .post(testingData.url + '/login')
          .send({userLogin: 'user555', userPassword: '333'})
          .accept('json')
          .end(function (err, res) {
            if (err) {
              console.log(err);
            }
            res.status.should.be.equal(200);
            res.body.should.have.property('message').be.equal('Authentication is successful');
            res.body.should.have.property('payload').have.property('token').to.be.a('string');
            token = res.body.payload.token;
            done();
          });
      });

      it('Should return status 200 - get users bids', function(done){
        request
          .get(testingData.url + '/bids')
          .set('authorization', token)
          .end(function(err, res) {
            res.status.should.be.equal(200);
            res.body.should.be.an('array');
            res.body[0].should.contain.keys("ID", "DateInsert", "Status", "Street", "Building", "Flat",
              "Category", "SubCategory", "PriorityID", "Priority", "StatusID", "Status", "MessageText", "ResponceOrg");
            done();
          })
      });

      it('Should return status 200 - get user bid by id', function(done){
        request
          .get(testingData.url + '/bid/630')
          .set('authorization', token)
          .end(function(err, res){
            res.status.should.be.equal(200);
            res.body.should.be.an('array');
            res.body[0].should.contain.keys("ID","IDDom", "IDIspolnit", "SurName", "Name", "Patronimik", "ID_FLAT", "DateInsert",
              "DateToComplete", "PhoneNumber", "MessageText", "IsControl", "Email", "IDDom_Z", "AdressOpis", "WorkOpis",
              "WorkCost", "WorkAmount", "WorkEd", "ID_FLAT_Z", "IDDispKateg", "IDDispPodKateg", "IDDispProblemType", "IDPriority",
              "IDOrg", "IDSocialStatus", "ID_TaDispStatuses", "ExtIspolnit", "WorkPlace", "Position", "Notify", "PayedBid", "WorkStart",
              "WorkEnd", "lat", "lng", "changed_manually", "ClientId", "Dom_nonexistent", "Flat_nonexistent", "Dom_Z_nonexistent",
              "Flat_Z_nonexistent", "Street_ID", "Street_ID_Z", "BidImages", "BidStrID", "HomStrID", "BidStrName", "HomStrName",
              "BidBldNum", "HomBldNum", "BidFltNum", "HomFltNum", "Category", "BidBldNum", "HomBldNum", "BidFltNum", "HomFltNum",
              "SubCategory", "Priority", "Status", "StatusID", "nameOfTheStreet", "nameOfTheHomeStreet");
            done();
          })
      });

      it('Should return status 401 - error get bids(user not authenticated)', function(done){
        request
          .get(testingData.url + '/bids')
          .end(function(err, res){
            res.status.should.be.equal(401);
            done();
          })
      })
    })

  })
};