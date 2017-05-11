var mongoose = require('mongoose');

var AdressSchema = new mongoose.Schema({
  userName: String,
  adressArr: Array,
});

exports.modelAdress= AdressSchema;
// adress: String,
// latAndLon: Array,
// status: Boolean,
// id: Number,
