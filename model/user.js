var mongoose = require('mongoose');

var PersonSchema = new mongoose.Schema({
  name:String,   //定义一个属性name，类型为String
  userName: String,
  password: String,
  role: String
});

exports.modleUser= PersonSchema;
