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
var { isEqual } = require('underscore');

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

// 登录
router.post('/login', koaBody, function*() {
  var data = JSON.parse(this.request.body);
  if (data.checkCode.toLowerCase() === code.toLowerCase()) {
    const result = yield PersonModel.find({ userName: data.userName });
    if (result.length !== 0) {
      const pass = JSON.parse(JSON.stringify(result[0])).password;
      if (pass == data.password) {
        var loginDate = new Date().getTime();
        var test = JSON.parse(JSON.stringify(result[0]));
        test.lastLogin = loginDate;
        PersonModel.update({ userName: data.userName}, { lastLogin: loginDate }, function(error) {
          console.log(error);
        });
        this.body = JSON.stringify({ success: true, data: test, remember: data.remember });
      } else {
        this.body = JSON.stringify({
          success: false,
          data: {
            errKey: 'pass',
            errMsg: '密码输入错误',
          }
        });
      }
    } else {
      this.body = JSON.stringify({
        success: false,
        data: {
          errKey: 'user',
          errMsg: '用户名不存在',
        }
      });
    }
  } else {
    this.body = JSON.stringify({
      success: false,
      data: {
        errKey: 'code',
        errMsg: '验证码输入错误',
      }
    });
  }
});

// 普通用户注册
router.post('/signup', koaBody, function*() {
  var data = JSON.parse(this.request.body);
  if (data.checkCode.toLowerCase() === code.toLowerCase()) {
    const result = yield PersonModel.find({ userName: data.userName });
    if (result.length !== 0) {
      this.body = JSON.stringify({
        success: false,
        data: {
          errKey: 'user',
          errMsg: '该用户名已存在',
        }
      });
    } else {
      console.log(data);
      var signDate = new Date().getTime();
      PersonModel.create({name: data.name, userName: data.userName, password: data.password, role: 'buyer', selfImg: '', startDate: signDate, lastLogin: signDate });
      this.body = {
        success: true,
        data: {
          name: data.name,
          userName: data.userName,
          remember: data.remember,
          role: 'buyer',
        }
      }
    }
  } else {
    this.body = JSON.stringify({
      success: false,
      data: {
        errKey: 'code',
        errMsg: '验证码输入错误',
      }
    });
  }
});

// 店家注册
router.post('/open', koaBody, function*() {
  var data = JSON.parse(this.request.body);
  if (data.checkCode.toLowerCase() === code.toLowerCase()) {
    const result = yield PersonModel.find({ userName: data.userName });
    console.log(result);
    if (result.length !== 0) {
      this.body = JSON.stringify({
        success: false,
        data: {
          errKey: 'user',
          errMsg: '该用户名已存在',
        }
      });
    } else {
      console.log(data);
      var openDate = new Date().getTime();
      PersonModel.create({name: data.name, userName: data.userName, password: data.password, role: 'seller', selfImg: '', startDate: openDate, lastLogin: openDate});
      StoreModel.create({ owner: data.userName, phone: data.userName, ownerName: data.name, startDate: openDate, album: [], typeMenu:[], orderNum: 0, dishNum: 0, status: true });
      this.body = {
        success: true,
        data: {
          name: data.name,
          userName: data.userName,
          remember: data.remember,
          role: 'seller',
        }
      }
    }
  } else {
    this.body = JSON.stringify({
      success: false,
      data: {
        errKey: 'code',
        errMsg: '验证码输入错误',
      }
    });
  }
});

// 退出登录
router.post('/logout', koaBody, function*() {
  var nick = this.cookies.get('name');
  this.cookies.set('name', undefined);
  if (nick != undefined) {
    nick = new Buffer(nick, 'base64').toString();
    cache.nameListActive.delete(nick);
    delete cache.nameList[nick];
  }
  this.body = '';
});

// 验证码
router.get('/code', koaBody, function*() {
  var ary = ccap.get();
  var txt = ary[0];
  var buf = ary[1];
  code = txt;
  console.log(code);
  this.body = buf;
});
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

// 上传用户照片
router.post('/buyerImg/upload', koaBody, function*(next) {
  var part = this.request.body.files.uploadFile;
  var fileName = part.name;
  var tmpath = part.path;
  var newpath = path.join('static/upload', Date.parse(new Date()).toString() + fileName);
  var stream = fs.createWriteStream(newpath);//创建一个可写流
  fs.createReadStream(tmpath).pipe(stream);//可读流通过管道写入可写流
  PersonModel.update({ userName: this.request.body.fields.userName }, { selfImg: 'http://localhost:5000/show?' + newpath }, function(error){
    console.log(error);
  });
  this.body={
    imgUrl: 'http://localhost:5000/show?' + newpath,
  };
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

router.post('/user/question/update', koaBody, function*() {
  const data = JSON.parse(this.request.body);
  PersonModel.update({ userName: data.userName }, { question: data.question }, function(error) {
    console.log(error);
  });
  const storeQuestion = yield StoreModel.findOne({ owner: data.owner }, { 'question' : 1 });
  for(var i = 0; i < storeQuestion.question.length ; i++) {
    if (storeQuestion.question[i].user === data.questInfo.asker && storeQuestion.question[i].time === data.questInfo.time) {
      const arr = storeQuestion.question[i].response || [];
      arr.push({ responser: data.userName, responseName: data.name, response: data.text });
      console.log(arr);
      storeQuestion.question[i].response = JSON.parse(JSON.stringify(arr));
      StoreModel.update({ owner: data.owner }, { question: storeQuestion.question }, function(error) {
        console.log(error);
      });
    }
  }
  this.body = {
    success: true,
  }
});

module.exports = router;
