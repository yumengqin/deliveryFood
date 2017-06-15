var router = require('koa-router')();
var path = require('path');
var koaBody = require('koa-body')({
  multipart: true,
  formidable: { uploadDir: path.join(__dirname) }
});
var ccap = require('ccap')();
var db = require('../db/db').db;
var mongoose = require('mongoose');
var fs = require('fs');

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

// // 上传店铺头像
router.post('/sellerImg/upload', koaBody, function*(next) {
  var part = this.request.body.files.uploadFile;
  var fileName = part.name;
  var tmpath = part.path;
  var newpath = path.join('static/upload', Date.parse(new Date()).toString() + fileName);
  var stream = fs.createWriteStream(newpath);//创建一个可写流
  fs.createReadStream(tmpath).pipe(stream);//可读流通过管道写入可写流
  StoreModel.update({ owner: this.request.body.fields.owner }, { selfImg: 'http://localhost:5000/show?' + newpath }, function(error) {
    console.log(error);
  });
  PersonModel.update({ userName: this.request.body.fields.owner }, { selfImg: 'http://localhost:5000/show?' + newpath }, function(error) {
    console.log(error);
  });
  this.body={
    imgUrl: 'http://localhost:5000/show?' + newpath,
  };
});

// 上传店家广告册
router.post('/storeImg/upload', koaBody, function*(next) {
  var part = this.request.body.files.uploadFile;
  var fileName = part.name;
  var tmpath = part.path;
  var newpath = path.join('static/upload', Date.parse(new Date()).toString() + fileName);
  var stream = fs.createWriteStream(newpath);//创建一个可写流
  fs.createReadStream(tmpath).pipe(stream);//可读流通过管道写入可写流
  this.body={
    imgUrl: 'http://localhost:5000/show?' + newpath,
  };
});

// 查询店铺信息
router.post('/store', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const result = yield StoreModel.findOne({ owner: data.userName });
  const food = yield AllMenuModel.find({ owner: data.userName });
  this.body = {
    success: true,
    data: result,
    menu: food,
  }
});

// 查询店铺菜品并排序
router.post('/store/menu', koaBody, function*() {
  const data = JSON.parse(this.request.body);
  let obj = {};
  if (data.sort) {
    obj[data.sort] = 'desc';
  }
  const food = yield AllMenuModel.find({ owner: data.userName }).sort(obj).exec(function(err, docs) {
    console.log(docs);
  });
  this.body = {
    success: true,
    menu: food,
  }
});

// 更改店铺信息
router.post('/store/update', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  StoreModel.update({ owner: data.userName }, data, {new: true}, function(error, res){
    console.log(data, error, res);
  });
  this.body = {
    success: true,
    data: data,
  }
});

// 设置店铺是否开启
router.post('/store/status', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  StoreModel.update({ owner: data.userName }, data, function(error, res){
    console.log(data, error, res);
  });
  this.body = {
    success: true,
    data: data,
  }
});

// 按类型查询店铺
router.post('/store/filter', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const filter = data.type ? {type: data.type, status: true } : {status: true} ;
  const result = yield StoreModel.find(filter);
  this.body = {
    success: true,
    data: result,
  }
});

// 搜索店铺
router.post('/store/search', koaBody, function*(next){
  const data = JSON.parse(this.request.body);
  const result = data.type ? yield StoreModel.find({ $or: [
    { keyWord: {'$regex': data.text , $options: '$i'} },
    { storeName: {'$regex': data.text , $options: '$i'} },
    { introduction: {'$regex': data.text , $options: '$i'} }
  ], type: data.type , status: true }) : yield StoreModel.find({ $or: [
    { keyWord: {'$regex': data.text , $options: '$i'} },
    { storeName: {'$regex': data.text , $options: '$i'} },
    { introduction: {'$regex': data.text , $options: '$i'} }
  ] });
  console.log(data, result);
  this.body = {
    success: true,
    data: result,
  }
});

// 店铺提问
router.post('/store/ask/put', koaBody, function*(next){
  const data = JSON.parse(this.request.body);
  const item = yield StoreModel.findOne({ owner: data.owner }, { 'question': 1 });
  const question = item.question;
  question.push({ user: data.asker, name: data.name, text: data.text });
  StoreModel.update({ owner: data.owner }, { question: question }, function(error, res){
    console.log(data, error, res);
  });
  this.body = {
    success: true,
  }
});

module.exports = router;
