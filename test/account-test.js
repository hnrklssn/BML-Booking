var chai = require("chai");
var expect = chai.expect;
var mongoose = require("mongoose");
var user = require("../src/accountschema");
var User = user.AccountModel;
mongoose.Promise = global.Promise;
//db exclusively for testing purposes
mongoose.connect("mongodb://localhost:27017/account_test");
describe("AccountsDB", function() {
  var currentUser = null;
  
  beforeEach(function(done) {
    currentUser = new User({
      name: "Test Name",
      email: "test@mail.xyz",
      pnum: "001298-0076",
      addr: "54 Fake Avenue",
      pcode: "89403",
      town: "Emptyville",
      passw: "s00pr5eCur3"
    });
    currentUser.save(function(err) {
      done();
    });
  });
  
  afterEach(function(done) {
    User.find({}, function(err, users) {
      User.remove({}, function() {
        done();
      });
    });
  });
  
  it("registers a new user", function(done) {
    newUser = new User({
      name: "Test2 Name2",
      email: "test2@mail.xyz",
      pnum: "001298-0276",
      addr: "254 Fake Avenue",
      pcode: "29403",
      town: "Emptytown",
      passw: "m3h5eCur3"
    });
    newUser.save(function(err) {
      expect(err).to.be.null;
      expect(newUser.name).to.equal("Test2 Name2");
      expect(newUser.email).to.equal("test2@mail.xyz");
      expect(newUser.pnum).to.equal("001298-0276");
      expect(newUser.addr).to.equal("254 Fake Avenue");
      expect(newUser.pcode).to.equal(29403);
      expect(newUser.town).to.equal("Emptytown");
      expect(newUser.passw).to.not.equal("m3h5eCur3");
      done();
    });
  });
  
  it("salts and hashes passwords", function(done) {
    newUser = new User({
      name: "Test3 '3' Name3",
      email: "t3st@ill.abc",
      pnum: "002346-0616",
      addr: "347 Non Rd",
      pcode: "23473",
      town: "None City",
      passw: "53cR37"
    });
    newUser2 = new User({
      name: "Test4 '4' Name4",
      email: "tsagt@idfg.abc",
      pnum: "513582-0654",
      addr: "347 Non Rd",
      pcode: "35463",
      town: "None City",
      passw: "53cR37"
    });
    newUser.save(function(err) {
      expect(err).to.be.null;
      newUser2.save(function(err2) {
        expect(err2).to.be.null;
        expect(newUser.passw).to.not.equal("53cR37");
        expect(newUser2.passw).to.not.equal("53cR37");
        expect(newUser.passw).to.not.equal(newUser2.passw);
        done();
      });
    });
  });
  
  it("authenticates user with correct password", function(done) {
    user.authenticate(currentUser.pnum, "s00pr5eCur3", function(status, authUser) {
      expect(status).to.equal(true);
      expect(authUser.name).to.equal(currentUser.name);
      expect(authUser.email).to.equal(currentUser.email);
      expect(authUser.pnum).to.equal(currentUser.pnum);
      expect(authUser.addr).to.equal(currentUser.addr);
      expect(authUser.pcode).to.equal(currentUser.pcode);
      expect(authUser.town).to.equal(currentUser.town);
      expect(authUser.passw).to.equal(currentUser.passw);
      done();
    });
  });
  
  it("denies user with incorrect password", function(done) {
    user.authenticate(currentUser.pnum, "wrongpass", function(status, authUser) {
      expect(status).to.equal(false);
      expect(authUser).to.be.null;
      done();
    });
  });
  
  it("does not differentiate between nonexistent ID and incorrect password", function(done) {
    user.authenticate(currentUser.pnum, "wrongpass", function(status, authUser) {
      user.authenticate("845299-8080", "userdoesnotexist", function(status2, authUser2) {
        expect(status).to.equal(status2);
        expect(authUser).to.equal(authUser2);
        done();
      });
    });
  });
  
  it("does not allow two users with the same pnum to be created", function(done) {
    newuser = new User({
      name: "Te3245st Name",
      email: "test@ma45il.xyz",
      pnum: "001298-0076",  //same as earlier record
      addr: "54 Fak345e Avenue",
      pcode: "09103",
      town: "Nowhere Creek",
      passw: "passw123"
    });
    newuser.save(function(err) {
      expect(err).to.not.be.null;
      done();
    });
  });
    
  it("does not allow two users with the same email to be created", function(done) {
    newuser = new User({
      name: "Te3245st Name",
      email: "test@mail.xyz",  //same as earlier record
      pnum: "034658-3576",
      addr: "54 Fak345e Avenue",
      pcode: "09103",
      town: "Nowhere Creek",
      passw: "passw123"
    });
    newuser.save(function(err) {
      expect(err).to.not.be.null;
      done();
    });
  });
});

var chaiHttp = require("chai-http");
chai.use(chaiHttp);
var server = require("../src/server");
var routes = require("../src/routes");
server.setRoutes(routes.routes);
server.start();

describe("User Account REST API", function() {
  
  beforeEach(function(done) {
    currentUser = new User({
      name: "Test Name",
      email: "test@mail.xyz",
      pnum: "001298-0076",
      addr: "54 Fake Avenue",
      pcode: "89403",
      town: "Emptyville",
      passw: "s00pr5eCur3"
    });
    currentUser.save(function(err) {
      done();
    });
  });
  
  afterEach(function(done) {
    User.remove({}, function() {
      done();
    });
  });
  
  it("should add users with POST /adduser", function(done) {
    var newUser = {
      name: "Test2 N45ame",
      email: "t3st@email.abc",
      pnum: "873457-8954",
      addr: "1010 Binary Way",
      pcode: "98351",
      town: "Digiville",
      passw: "l33th4xxp455"
    }
    chai.request(server.app)
      .post("/adduser")
      .send(newUser)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys("errors", "name");
        expect(res.body.errors).to.be.null;
        expect(res.body.name).to.equal(newUser.name);
        User.find({ name: newUser.name }, function(err, users) {
          expect(err).to.be.null;
          expect(users[0]).to.have.property("name", newUser.name);
          done();
        });
      });
  });
  
  it("should not register users with bad request structure", function(done) {
    var newUser = {
      name: "Test2 N45ame",
      email: "t3st@email.abc",
      pnum: "873457-8954",
      addr: "1010 Binary Way",
      town: "Digiville",
      passw: "l33th4xxp455",
      extraProp: "incorrect"
    };
    chai.request(server.app)
      .post("/adduser")
      .send(newUser)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.have.all.keys("errors", "name");
        expect(res.body.name).to.be.null;
        expect(res.body.errors).to.have.all.keys(["missing", "extra", "bad value"]);
        expect(res.body.errors).to.have.property({ "bad value": null });
        expect(res.body.errors).to.have.deep.property({ extra: { extraProp: "incorrect" } });
        expect(res.body.errors).to.have.property({ missing: "pcode" });
        User.find({ name: newUser.name }, function(err, users) {
          expect(err).to.not.be.null;
          expect(users).to.be.empty;
          done();
        });
      });
  });
  
  it("should not register users with impossible email or personal number", function(done) {
    var newUser = {
      name: "Test2 N45ame",
      email: "t3st.email.abc",  //no @
      pnum: "873457-89547",     //extra digit
      addr: "1010 Binary Way",
      pcode: "23457",
      town: "Digiville",
      passw: "l33th4xxp455"
    };
    chai.request(server.app)
      .post("/adduser")
      .send(newUser)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.have.all.keys("errors", "name");
        expect(res.body.name).to.be.null;
        expect(res.body.errors).to.have.all.keys(["missing", "extra", "bad value"]);
        expect(res.body.errors).to.have.deep.property({ "bad value": {
          email: "t3st.email.abc",
          pnum: "873457-89547"
        }});
        expect(res.body.errors.extra).to.be.null;
        expect(res.body.errors.missing).to.be.null;
        User.find({ name: newUser.name }, function(err, users) {
          expect(err).to.not.be.null;
          expect(users).to.be.empty;
          done();
        });
      });
  });
  
  it("should not register users with the same email or personal number", function(done) {
    var newUser = {
      name: "Test2 N45ame",
      email: "t3st@email.abc",
      pnum: "001298-0076", //same as previous user
      addr: "1010 Binary Way",
      pcode: "89532",
      town: "Digiville",
      passw: "l33th4xxp455"
    };
    var newUser2 = {
      name: "Test2 N45ame",
      email: "test@mail.xyz", //same as previous user 
      pnum: "324561-7363",
      addr: "1010 Binary Way",
      pcode: "89532",
      town: "Digiville",
      passw: "l33th4xxp455"
    };
    chai.request(server.app)
      .post("/adduser")
      .send(newUser)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.have.all.keys("errors", "name");
        expect(res.body.name).to.be.null;
        expect(res.body.errors).to.include({ "user already exists": 
          { pnum: true, email: false } });
        User.find({ name: newUser.name }, function(err, users) {
          expect(err).to.not.be.null;
          expect(users).to.be.empty;
          chai.request(server.app)
            .post("/adduser")
            .send(newUser2)
            .end(function(err, res) {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body).to.have.all.keys("errors", "name");
              expect(res.body.name).to.be.null;
              expect(res.body.errors).to.include({ "user already exists": 
                { pnum: false, email: true } });
              User.find({ name: newUser2.name }, function(err, users) {
                expect(err).to.not.be.null;
                expect(users).to.be.empty;
                done();
              });
            });
        });
      });
  });
  
});