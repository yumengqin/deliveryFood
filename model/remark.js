var mongoose = require('mongoose');

var RearkSchema = new mongoose.Schema({
  menuIdArr: Array,  // 评论包含的菜品id
  score: Number,
  name: String,  // 评论人
  createDate: Number,// 时间
  store: String,
  text: String,
});

exports.modelRemark= RearkSchema;
