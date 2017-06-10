var router = require('koa-router')();
var path = require('path');
var koaBody = require('koa-body')({
  multipart: true,
  formidable: { uploadDir: path.join(__dirname) }
});
var ccap = require('ccap')();
var db = require('../db/db').db;
var mongoose = require('mongoose');

var PersonSchema = require('../model/user').modleUser;
var StoreSchema = require('../model/store').modleStore;
var AllMenuSchema = require('../model/allMenu').modelAllMenu;
var CollectSchema = require('../model/collect').modelCollect;
var AdressSchema = require('../model/buyerAdress').modelAdress;
var OrderSchema = require('../model/order').modelOrder;

var PersonModel = db.model('user',PersonSchema);
var StoreModel = db.model('store',StoreSchema);
var AllMenuModel = db.model('food', AllMenuSchema);
var CollectModel = db.model('collect', CollectSchema);
var AdressModel = db.model('adr', AdressSchema);
var OrderModel = db.model('order', OrderSchema);

router.post('/order/create', koaBody, function*(next){
  const data = JSON.parse(this.request.body);
  OrderModel.create(data);
  const num = (yield StoreModel.findOne({ owner: data.orderStore })).orderNum;
  StoreModel.update({ owner: data.orderStore }, { orderNum: num + 1 }, function(error) {
    console.log(error);
  });
  for (var i = 0; i < data.menuArr.length; i ++) {
    let num = (yield AllMenuModel.findOne({ id: data.menuArr[i].id })).orderNum || 0;
    num = num + data.menuArr[i].number;
    AllMenuModel.update({ id: data.menuArr[i].id }, { orderNum: num }, function(error) {
      console.log(error);
    });
  }
  this.body = {
    success: true,
    data: data,
  }
});

// 查询买家订单
router.post('/buyer/order', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const result = yield OrderModel.find({ userName: data.userName });
  this.body = {
    success: true,
    data: result,
  }
});

// 查询卖家订单
router.post('/seller/order', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const result = yield OrderModel.find({ seller: data.owner });
  this.body = {
    success: true,
    data: result,
  }
});

// 更改订单状态
router.post('/order/update', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  OrderModel.update({ _id: data._id }, { status: data.status }, function(err){
    console.log(err);
  });
  this.body = {
    success: true,
  }
});

// 查询订单
router.post('/order/show', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  const result = yield OrderModel.findOne({ _id: data._id });
  this.body = {
    success: true,
    data: result,
  }
});

module.exports = router;
