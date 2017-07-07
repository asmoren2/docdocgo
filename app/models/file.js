// model an file schema for mongo
// Author: Adolfo Moreno

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var fileSchema = mongoose.Schema({
  file: {
      data: String,
      contentType: String,
      patientID: String,
      name: String,
    },
  });

  module.exports = mongoose.model('File', fileSchema);
