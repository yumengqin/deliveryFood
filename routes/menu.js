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
var RemarkSchema = require('../model/remark').modelRemark;

var PersonModel = db.model('user',PersonSchema);
var StoreModel = db.model('store',StoreSchema);
var AllMenuModel = db.model('food', AllMenuSchema);
var CollectModel = db.model('collect', CollectSchema);
var AdressModel = db.model('adr', AdressSchema);
var OrderModel = db.model('order', OrderSchema);
var RemarkModel = db.model('remark', RemarkSchema);


// 创建菜品
router.post('/menu/create', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  AllMenuModel.create(data);
  this.body = {
    success: true,
    data: data,
  }
});

// 修改菜品
router.post('/menu/update', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  AllMenuModel.update({ id: data.id }, data, function(error){
    console.log(error);
  });
  this.body = {
    success: true,
    data: data,
  }
});

// 上传菜品图片
router.post('/menuImg/upload', koaBody, function*(next) {
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

// 获取菜品信息
router.post('/menu/show', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  const result = yield AllMenuModel.findOne({ id: data.id });
  this.body = {
    success: true,
    data: result,
  }
});

// 根据类型选取菜品
router.post('/menu/filter', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  const obj = (data.type === '全部' || !data.type) ? { owner: data.owner } : { owner: data.owner, type: data.type };
  const result = yield AllMenuModel.find(obj);
  this.body = {
    success: true,
    data: result,
  }
});

// 删除菜品
router.post('/menu/delete', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  const result = yield AllMenuModel.remove({ id: data.id }, function(err, result) {
    console.log(err, result);
  });
  this.body = {
    success: true,
    data: result,
  }
});


// 生成订单
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


module.exports = router;
