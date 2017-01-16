var mongoose = require('monoose');
var Schema = mongoose.Schema;
var AccountSchema = Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  pnum: {
    type: String
  },
  addr: {
    type: String
  },
  pcode: {
    type: Number
  },
  passw: {
    type: String
  }
});

var AccountModel = mongoose.model('Account', AccountSchema);

module.exports = AccountModel;
