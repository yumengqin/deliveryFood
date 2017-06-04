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

module.exports = router;
