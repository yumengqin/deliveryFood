var mongoose = require('mongoose');

var MenuSchema = new mongoose.Schema({
  owner:String,   //定义一个属性name，类型为String
  menuType: Array,
  menuArr: Array,
});

exports.modelMenu= MenuSchema;
//[
//   {
//     id: Number,
//     type: String,
//     description: String,
//     price: Number,
//     boxPrice: Number
//   }
// ],
