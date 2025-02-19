var mongoose = require('mongoose');
var accountschema = require('./accountschema');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var url = 'mongodb://localhost:27017/bokning';
var mongo = null;
mongoose.Promise = global.Promise;

function connect() {
  mongoose.connection.on("connected", function() {
    console.log('Connected to database')
  });
  mongoose.connect(url, function(err) {
    if (err) throw err;
    return new mongoStore({
    	mongooseConnection: mongoose.connection,
    	collection: 'sessions' // default
  	});
  });
}

exports.User = accountschema.AccountModel;
exports.connect = connect;