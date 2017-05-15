var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({
  menuArr: Array,    // 订单菜品数组
  allPrice: Number,  // 订单价钱
  createDate: Number,// 订单创建时间
  remark: String, // 订单备注
  userName: String,
  status: String,  // place 已下单， delivery  派送中， over  已结束
  seller: String,
  orderStore: String,
  orderStoreName: String,
  orderStoreImg: String,
  remark: String,
});

exports.modelOrder= OrderSchema;
