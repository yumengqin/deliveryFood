var koa = require('koa');
var path = require('path');
var formParse = require('co-busboy');
var route = require('koa-route');
var views = require('co-views');
var webpack = require('webpack');
var koaBody = require('koa-body')({
  multipart: true,
  formidable: { uploadDir: path.join(__dirname) }
});
var router  = require('koa-router')();
var webpackDev = require('koa-webpack-dev-middleware');
var webpackConf = require('./webpack.config.js');
var compiler = webpack(webpackConf);
var serve = require('koa-static');
var http = require('http');
var fs = require('fs');
var ccap = require('ccap')();
var app = new koa();


var db = require('./db/db').db;
var mongoose = require('mongoose');

var PersonSchema = require('./model/user').modleUser;
var StoreSchema = require('./model/store').modleStore;
var AllMenuSchema = require('./model/allMenu').modelAllMenu;
var CollectSchema = require('./model/collect').modelCollect;

db.on('error', function(error) {
    console.log('连接失败', error);
});

db.on('open', function () {
  console.log('连接成功');
});

var PersonModel = db.model('user',PersonSchema);
var StoreModel = db.model('store',StoreSchema);
var AllMenuModel = db.model('food', AllMenuSchema);
var CollectModel = db.model('collect', CollectSchema);
// var login = require('./db/login').login;

var render = views('./src', {
  ext: 'ejs'
});

var server = require('http').Server(app.callback());
var io = require('socket.io')(server);

var code = '';

var cache = {
  nameList: {},
  nameListActive: new Set([]),
  msgList: []
};

var sessionFresh = setInterval(function() {
  for (var key in cache.nameList) {
    cache.nameList[key] -= 10000;
    if (cache.nameList[key] <= 0) {
      delete cache.nameList[key];
    }
  }
}, 10000);

// io.on('connection', function(socket) {
//   socket.on('msg from client', function(data) {
//     if (!cache.nameListActive.has(data.nickName)) {
//       socket.emit('self logout');
//     } else {
//       socket.broadcast.emit('msg from server', data);
//       cache.msgList.push(data);
//       if (cache.msgList.length >= 100) {
//         cache.msgList.shift();
//       }
//     }
//   });
//   socket.on('disconnect', function() {
//     cache.nameListActive.delete(socket.nickname);
//     io.emit('guest update',
//       [...cache.nameListActive]
//     );
//   });
//   socket.on('guest come', function(data) {
//     cache.nameListActive.add(data);
//     cache.nameList[data] = 7200000;
//     socket.nickname = data;
//     io.emit('guest update',
//       [...cache.nameListActive]
//     );
//   });
//   socket.on('guest leave', function(data) {
//     cache.nameListActive.delete(data);
//     delete cache.nameList[data];
//     socket.nickname = undefined;
//     io.emit('guest update',
//       [...cache.nameListActive]
//     );
//   });
//   socket.on('heart beat', function() {
//     if (socket.nickname != undefined) {
//       cache.nameList[socket.nickname] = 7200000;
//     }
//   });
// });

app.use(webpackDev(compiler, {
  contentBase: webpackConf.output.path,
  publicPath: webpackConf.output.publicPath,
  hot: false
}));

app.use(serve('./dist'));

app.use(route.get('/', function*() {
  // var tank = {name: 'something'};
  // PersonModel.create(tank);
  // console.log(personEntity.name); //Krouky
  this.body = yield render('index', {});
}));

app.use(route.get('/api/auth', function*() {
  if (this.cookies.get('name') == undefined) {
    this.body = JSON.stringify({
      permit: false
    });
  } else {
    var nick = this.cookies.get('name');
    nick = new Buffer(nick, 'base64').toString();
    this.body = JSON.stringify({
      permit: true,
      nickname: nick
    });
  }
}));

app.use(route.post('/api/nickname', function*() {
  console.log(this.request.query);
  if (this.cookies.get('name') != undefined) {
    this.body = JSON.stringify({
      legal: 'self login'
    })
  } else {
    var rawBody = yield parse(this, {});
    if (!(rawBody in cache.nameList)) {
      var body = new Buffer(rawBody).toString('base64');
      this.cookies.set('name', body, {
        maxAge: 7200000
      });
      this.body = JSON.stringify({
        legal: 'yes'
      });
    } else {
      this.body = JSON.stringify({
        legal: 'repeat'
      });
    }
  }
}));

// 登录
router.post('/api/login', koaBody, function*() {
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
router.post('/api/signup', koaBody, function*() {
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
router.post('/api/open', koaBody, function*() {
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
router.post('/api/logout', koaBody, function*() {
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
router.get('/api/code', koaBody, function*() {
  var ary = ccap.get();
  var txt = ary[0];
  var buf = ary[1];
  code = txt;
  console.log(code);
  this.body = buf;
});

// 上传店铺头像
router.post('/api/storeImg/upload', koaBody, function*(next) {
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
router.post('/api/storeImg/upload', koaBody, function*(next) {
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

// 显示图片
router.get('/show', function(){
  var url = this.request.url;
  var path = url.split('?')[1];
  var img = fs.createReadStream(path);
  this.body = img;
});

// 查询用户信息
router.post('/api/user', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const result = yield PersonModel.findOne({ userName: data.userName });
  this.body = {
    success: true,
    data: result,
  }
});

// 查询用户收藏
router.post('/api/user/collect', koaBody, function*() {
  const data = JSON.parse(this.request.body);
  const collect = yield CollectModel.findOne({ userName: data.userName });
  this.body = {
    success: true,
    data: collect,
  }
});

// 收藏店铺
router.post('/api/user/setCollect', koaBody, function*(){
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

// 更改用户信息
router.post('/api/user/update', koaBody, function*(){
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

// 查询店铺信息
router.post('/api/store', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const result = yield StoreModel.findOne({ owner: data.userName });
  const food = yield AllMenuModel.find({ owner: data.userName });
  this.body = {
    success: true,
    data: result,
    menu: food,
  }
});

// 更改店铺信息
router.post('/api/store/update', koaBody, function*(){
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
router.post('/api/store/status', koaBody, function*(){
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
router.post('/api/store/filter', koaBody, function*(){
  const data = JSON.parse(this.request.body);
  const filter = data.type ? {type: data.type, status: true } : {status: true} ;
  const result = yield StoreModel.find(filter);
  this.body = {
    success: true,
    data: result,
  }
});

// 创建菜品
router.post('/api/menu/create', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  AllMenuModel.create(data);
  this.body = {
    success: true,
    data: data,
  }
});

router.post('/api/menu/update', koaBody, function*(next) {
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
router.post('/api/menuImg/upload', koaBody, function*(next) {
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
router.post('/api/menu/show', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  const result = yield AllMenuModel.findOne({ id: data.id });
  this.body = {
    success: true,
    data: result,
  }
});

// 根据类型选取菜品
router.post('/api/menu/filter', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  const obj = (data.type === '全部' || !data.type) ? { owner: data.owner } : { owner: data.owner, type: data.type };
  const result = yield AllMenuModel.find(obj);
  this.body = {
    success: true,
    data: result,
  }
});

router.post('/api/menu/delete', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  const result = yield AllMenuModel.remove({ id: data.id }, function(err, result) {
    console.log(err, result);
  });
  this.body = {
    success: true,
    data: result,
  }
});
app.use(router.routes());

server.listen(process.env.PORT || 5000, function() {
  console.log('listening');
});

server.on('error', err => {
  console.log('error --> ', err.message);
  process.exit(1);
});
