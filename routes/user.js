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

// 查询用户信息
router.post('/user', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const result = yield PersonModel.findOne({ userName: data.userName });
  this.body = {
    success: true,
    data: result,
  }
});

// 查询用户详细信息（个人信息，用户收藏，用户地址）
router.post('/user/info', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const result = yield PersonModel.findOne({ userName: data.userName });
  const collect = yield CollectModel.findOne({ userName: data.userName });
  const adress = yield AdressModel.findOne({ userName: data.userName });
  this.body = {
    success: true,
    data: result,
    collect: collect,
    adress: adress,
  }
});

// 查询用户地址
router.post('/user/adress', koaBody, function*() {
  const data = JSON.parse(this.request.body);
  const adress = yield AdressModel.findOne({ userName: data.userName });
  this.body = {
    success: true,
    adress: adress ? adress.adressArr : [],
  }
});

// 更改用户地址（包括添加地址，修改地址，更改默认地址）
router.post('/user/adress/update', koaBody, function*() {
  const data = JSON.parse(this.request.body);
  const result = yield AdressModel.find({ userName: data.userName });
  console.log(result, result.length);
  if (!result.length || result.length === 0) {
    AdressModel.create({ userName: data.userName, adressArr: data.adressArr });
  } else {
    AdressModel.update({ userName: data.userName }, { adressArr: data.adressArr }, function(error) {
      console.log(error);
    });
  }
  this.body = {
    success: true,
  }
});
// 查询用户收藏
router.post('/user/collect', koaBody, function*() {
  const data = JSON.parse(this.request.body);
  const collect = yield CollectModel.findOne({ userName: data.userName });
  this.body = {
    success: true,
    data: collect,
  }
});

// 收藏店铺
router.post('/user/setCollect', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const result = yield CollectModel.find({ userName: data.userName });
  if (result.length === 0) {
    CollectModel.create({ userName: data.userName, collectArr: data.collectArr });
  }
  else {
    CollectModel.update({ userName: data.userName }, { collectArr: data.collectArr }, function(error){
      console.log(error);
    });
  }
  this.body = {
    success: true,
    data: data.collectArr,
  }
});


// 查询用户收藏店铺详情
router.post('/user/collect/show', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const collect = yield CollectModel.findOne({ userName: data.userName });
  console.log(collect.collectArr);
  const result = yield StoreModel.find().where('owner', collect.collectArr).exec(function(err, docs){
    console.log(docs);
  });
  this.body = {
    success: data,
    data: result,
  };
});

// 更改用户信息
router.post('/user/update', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  var birDate = new Date(data.date).getTime();
  data.date = birDate;
  PersonModel.update({ userName: data.userName }, data, function(error){
    console.log(error);
  });
  this.body = {
    success: true,
    data: data,
  }
});

module.exports = router;
