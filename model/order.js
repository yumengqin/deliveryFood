var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({
  id: String,        // 订单id
  menuArr: Array,    // 订单菜品数组
  allPrice: Number,  // 订单价钱
  orderNo: Number,   // 订单编号
  createDate: Number,// 订单创建时间
});

exports.modelOrder= OrderSchema;
