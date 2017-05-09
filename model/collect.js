var mongoose = require('mongoose');

var CollectSchema = new mongoose.Schema({
  userName: String,
  collectArr: Array,
});

exports.modelCollect= CollectSchema;
// menuId: String,
// menuName: String,
// menuImg: String,
// menuPrice: Number,
// menuNum: Number,
