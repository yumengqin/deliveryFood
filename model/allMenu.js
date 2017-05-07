var mongoose = require('mongoose');

var MenuSchema = new mongoose.Schema({
  id: String,
  owner: String,
  menuName: String,
  type: String,
  img: String,
  intro: String,
  price: Number,
  boxPrice: Number
});

exports.modelAllMenu= MenuSchema;
