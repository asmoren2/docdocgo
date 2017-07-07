// model an appointment schema for mongo
// Author: Adolfo Moreno
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var appSchema = mongoose.Schema({
  appointment: {
    uID: String,
    date: Date,
    doc: String,
    subj: String,
    status: String,
    message: String
  },
});

module.exports = mongoose.model('Appointment', appSchema);
