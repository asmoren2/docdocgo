// model a user schema for mongo
// Author: Adolfo Moreno

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');


var userSchema = mongoose.Schema({
  local : {
    email : String,
    password : String,
    doctor : Boolean,
    address : String,
    phone : Number,
  },
  name : {
    first: String,
    last: { type: String, trim: true }
  },
  dob :{
    birthdate : String,
  },
});

// Generate hash for password
userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

// Check for valid password
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password);

}

module.exports = mongoose.model('User', userSchema);
