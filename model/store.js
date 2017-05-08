var mongoose = require('mongoose');

var StoreSchema = new mongoose.Schema({
  owner:String,   //定义一个属性name，类型为String
  phone: String,
  ownerName: String,
  storeName: String,
  type: String,
  keyWord: String,
  introduction: String,
  adress: String,
  album: Array,
  typeMenu: Array,
  srartDate: Number,
  star: Number,
  orderNum: Number,
  dishNum: Number,
  sendPrice: Number,
  option: Array,
});

exports.modleStore= StoreSchema;
