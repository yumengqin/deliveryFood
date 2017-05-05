var mongoose = require('mongoose');

var StoreSchema = new mongoose.Schema({
  owner:String,   //定义一个属性name，类型为String
  phone: String,
  ownerName: String,
  type: String,
  keyWord: String,
  adress: String,
  album: Array,
  srartDate: Number,
  star: Number,
  orderNum: Number,
  dishNum: Number,
});

exports.modleStore= StoreSchema;
