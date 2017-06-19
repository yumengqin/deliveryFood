var koa = require('koa');
var path = require('path');
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
var AdressSchema = require('./model/buyerAdress').modelAdress;
var OrderSchema = require('./model/order').modelOrder;
var RemarkSchema = require('./model/remark').modelRemark;

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
var AdressModel = db.model('adr', AdressSchema);
var OrderModel = db.model('order', OrderSchema);
var RemarkModel = db.model('remark', RemarkSchema);
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

io.on('connection', function(socket) {
  socket.on('checkOrder', function(obj){
    var result = [];
    for(var i = 0; i < obj.length; i ++) {
      if (obj[i].status === 'place' && (obj[i].createDate + 600000) < new Date().getTime()) {
        result.push({ _id : obj[i]._id, status: 'outtime' });
      } else if (obj[i].status === 'delivery' && (obj[i].createDate + 604800000) < new Date().getTime()) {
        result.push({ _id : obj[i]._id, status: 'over' });
      }
    }
    socket.emit('checkOrder', result);
	});
});

app.use(webpackDev(compiler, {
  contentBase: webpackConf.output.path,
  publicPath: webpackConf.output.publicPath,
  hot: false
}));

app.use(serve('./dist'));

app.use(route.get('/', function*() {
  this.body = yield render('index', {});
}));

const index = require('./routes/index');
const user = require('./routes/user');
const store = require('./routes/store');
const menu = require('./routes/menu');
const order = require('./routes/order');
const remark = require('./routes/remark');
router.use('/api', index.routes(), index.allowedMethods());
router.use('/api', user.routes(), user.allowedMethods());
router.use('/api', store.routes(), store.allowedMethods());
router.use('/api', menu.routes(), menu.allowedMethods());
router.use('/api', order.routes(), order.allowedMethods());
router.use('/api', remark.routes(), remark.allowedMethods());

// 显示图片
router.get('/show', function(){
  var url = this.request.url;
  var path = url.split('?')[1];
  var img = fs.createReadStream(path);
  this.body = img;
});

app.use(router.routes());

server.listen(process.env.PORT || 5000, function() {
  console.log('listening');
});

server.on('error', err => {
  console.log('error --> ', err.message);
  process.exit(1);
});

// // 登录
// router.post('/api/login', koaBody, function*() {
//   var data = JSON.parse(this.request.body);
//   if (data.checkCode.toLowerCase() === code.toLowerCase()) {
//     const result = yield PersonModel.find({ userName: data.userName });
//     if (result.length !== 0) {
//       const pass = JSON.parse(JSON.stringify(result[0])).password;
//       if (pass == data.password) {
//         var loginDate = new Date().getTime();
//         var test = JSON.parse(JSON.stringify(result[0]));
//         test.lastLogin = loginDate;
//         PersonModel.update({ userName: data.userName}, { lastLogin: loginDate }, function(error) {
//           console.log(error);
//         });
//         this.body = JSON.stringify({ success: true, data: test, remember: data.remember });
//       } else {
//         this.body = JSON.stringify({
//           success: false,
//           data: {
//             errKey: 'pass',
//             errMsg: '密码输入错误',
//           }
//         });
//       }
//     } else {
//       this.body = JSON.stringify({
//         success: false,
//         data: {
//           errKey: 'user',
//           errMsg: '用户名不存在',
//         }
//       });
//     }
//   } else {
//     this.body = JSON.stringify({
//       success: false,
//       data: {
//         errKey: 'code',
//         errMsg: '验证码输入错误',
//       }
//     });
//   }
// });
//
// // 普通用户注册
// router.post('/api/signup', koaBody, function*() {
//   var data = JSON.parse(this.request.body);
//   if (data.checkCode.toLowerCase() === code.toLowerCase()) {
//     const result = yield PersonModel.find({ userName: data.userName });
//     if (result.length !== 0) {
//       this.body = JSON.stringify({
//         success: false,
//         data: {
//           errKey: 'user',
//           errMsg: '该用户名已存在',
//         }
//       });
//     } else {
//       console.log(data);
//       var signDate = new Date().getTime();
//       PersonModel.create({name: data.name, userName: data.userName, password: data.password, role: 'buyer', selfImg: '', startDate: signDate, lastLogin: signDate });
//       this.body = {
//         success: true,
//         data: {
//           name: data.name,
//           userName: data.userName,
//           remember: data.remember,
//           role: 'buyer',
//         }
//       }
//     }
//   } else {
//     this.body = JSON.stringify({
//       success: false,
//       data: {
//         errKey: 'code',
//         errMsg: '验证码输入错误',
//       }
//     });
//   }
// });
//
// // 店家注册
// router.post('/api/open', koaBody, function*() {
//   var data = JSON.parse(this.request.body);
//   if (data.checkCode.toLowerCase() === code.toLowerCase()) {
//     const result = yield PersonModel.find({ userName: data.userName });
//     console.log(result);
//     if (result.length !== 0) {
//       this.body = JSON.stringify({
//         success: false,
//         data: {
//           errKey: 'user',
//           errMsg: '该用户名已存在',
//         }
//       });
//     } else {
//       console.log(data);
//       var openDate = new Date().getTime();
//       PersonModel.create({name: data.name, userName: data.userName, password: data.password, role: 'seller', selfImg: '', startDate: openDate, lastLogin: openDate});
//       StoreModel.create({ owner: data.userName, phone: data.userName, ownerName: data.name, startDate: openDate, album: [], typeMenu:[], orderNum: 0, dishNum: 0, status: true });
//       this.body = {
//         success: true,
//         data: {
//           name: data.name,
//           userName: data.userName,
//           remember: data.remember,
//           role: 'seller',
//         }
//       }
//     }
//   } else {
//     this.body = JSON.stringify({
//       success: false,
//       data: {
//         errKey: 'code',
//         errMsg: '验证码输入错误',
//       }
//     });
//   }
// });
//
// // 退出登录
// router.post('/api/logout', koaBody, function*() {
//   var nick = this.cookies.get('name');
//   this.cookies.set('name', undefined);
//   if (nick != undefined) {
//     nick = new Buffer(nick, 'base64').toString();
//     cache.nameListActive.delete(nick);
//     delete cache.nameList[nick];
//   }
//   this.body = '';
// });
//
// // 验证码
// router.get('/api/code', koaBody, function*() {
//   var ary = ccap.get();
//   var txt = ary[0];
//   var buf = ary[1];
//   code = txt;
//   console.log(code);
//   this.body = buf;
// });

// // 上传店铺头像
// router.post('/api/storeImg/upload', koaBody, function*(next) {
//   var part = this.request.body.files.uploadFile;
//   var fileName = part.name;
//   var tmpath = part.path;
//   var newpath = path.join('static/upload', Date.parse(new Date()).toString() + fileName);
//   var stream = fs.createWriteStream(newpath);//创建一个可写流
//   fs.createReadStream(tmpath).pipe(stream);//可读流通过管道写入可写流
//   StoreModel.update({ owner: this.request.body.fields.owner }, { selfImg: 'http://localhost:5000/show?' + newpath }, function(error) {
//     console.log(error);
//   });
//   PersonModel.update({ userName: this.request.body.fields.owner }, { selfImg: 'http://localhost:5000/show?' + newpath }, function(error) {
//     console.log(error);
//   });
//   this.body={
//     imgUrl: 'http://localhost:5000/show?' + newpath,
//   };
// });
//
// // 上传店家广告册
// router.post('/api/storeImg/upload', koaBody, function*(next) {
//   var part = this.request.body.files.uploadFile;
//   var fileName = part.name;
//   var tmpath = part.path;
//   var newpath = path.join('static/upload', Date.parse(new Date()).toString() + fileName);
//   var stream = fs.createWriteStream(newpath);//创建一个可写流
//   fs.createReadStream(tmpath).pipe(stream);//可读流通过管道写入可写流
//   this.body={
//     imgUrl: 'http://localhost:5000/show?' + newpath,
//   };
// });

// // 查询用户信息
// router.post('/api/user', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   const result = yield PersonModel.findOne({ userName: data.userName });
//   this.body = {
//     success: true,
//     data: result,
//   }
// });
//
// // 查询用户详细信息（个人信息，用户收藏，用户地址）
// router.post('/api/user/info', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   const result = yield PersonModel.findOne({ userName: data.userName });
//   const collect = yield CollectModel.findOne({ userName: data.userName });
//   const adress = yield AdressModel.findOne({ userName: data.userName });
//   this.body = {
//     success: true,
//     data: result,
//     collect: collect,
//     adress: adress,
//   }
// });
//
// // 查询用户地址
// router.post('/api/user/adress', koaBody, function*() {
//   const data = JSON.parse(this.request.body);
//   const adress = yield AdressModel.findOne({ userName: data.userName });
//   this.body = {
//     success: true,
//     adress: adress ? adress.adressArr : [],
//   }
// });
//
// // 更改用户地址（包括添加地址，修改地址，更改默认地址）
// router.post('/api/user/adress/update', koaBody, function*() {
//   const data = JSON.parse(this.request.body);
//   const result = yield AdressModel.find({ userName: data.userName });
//   console.log(result, result.length);
//   if (!result.length || result.length === 0) {
//     AdressModel.create({ userName: data.userName, adressArr: data.adressArr });
//   } else {
//     AdressModel.update({ userName: data.userName }, { adressArr: data.adressArr }, function(error) {
//       console.log(error);
//     });
//   }
//   this.body = {
//     success: true,
//   }
// });
// // 查询用户收藏
// router.post('/api/user/collect', koaBody, function*() {
//   const data = JSON.parse(this.request.body);
//   const collect = yield CollectModel.findOne({ userName: data.userName });
//   this.body = {
//     success: true,
//     data: collect,
//   }
// });
//
// // 收藏店铺
// router.post('/api/user/setCollect', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   const result = yield CollectModel.find({ userName: data.userName });
//   if (result.length === 0) {
//     CollectModel.create({ userName: data.userName, collectArr: data.collectArr });
//   }
//   else {
//     CollectModel.update({ userName: data.userName }, { collectArr: data.collectArr }, function(error){
//       console.log(error);
//     });
//   }
//   this.body = {
//     success: true,
//     data: data.collectArr,
//   }
// });
//
//
// // 查询用户收藏店铺详情
// router.post('/api/user/collect/show', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   const collect = yield CollectModel.findOne({ userName: data.userName });
//   console.log(collect.collectArr);
//   const result = yield StoreModel.find().where('owner', collect.collectArr).exec(function(err, docs){
//     console.log(docs);
//   });
//   this.body = {
//     success: data,
//     data: result,
//   };
// });
//
// // 更改用户信息
// router.post('/api/user/update', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   var birDate = new Date(data.date).getTime();
//   data.date = birDate;
//   PersonModel.update({ userName: data.userName }, data, function(error){
//     console.log(error);
//   });
//   this.body = {
//     success: true,
//     data: data,
//   }
// });

// // 查询店铺信息
// router.post('/api/store', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   const result = yield StoreModel.findOne({ owner: data.userName });
//   const food = yield AllMenuModel.find({ owner: data.userName });
//   this.body = {
//     success: true,
//     data: result,
//     menu: food,
//   }
// });
//
// // 查询店铺菜品并排序
// router.post('/api/store/menu', koaBody, function*() {
//   const data = JSON.parse(this.request.body);
//   let obj = {};
//   if (data.sort) {
//     obj[data.sort] = 'desc';
//   }
//   const food = yield AllMenuModel.find({ owner: data.userName }).sort(obj).exec(function(err, docs) {
//     console.log(docs);
//   });
//   this.body = {
//     success: true,
//     menu: food,
//   }
// });
//
// // 更改店铺信息
// router.post('/api/store/update', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   StoreModel.update({ owner: data.userName }, data, {new: true}, function(error, res){
//     console.log(data, error, res);
//   });
//   this.body = {
//     success: true,
//     data: data,
//   }
// });
//
// // 设置店铺是否开启
// router.post('/api/store/status', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   StoreModel.update({ owner: data.userName }, data, function(error, res){
//     console.log(data, error, res);
//   });
//   this.body = {
//     success: true,
//     data: data,
//   }
// });
//
// // 按类型查询店铺
// router.post('/api/store/filter', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   const filter = data.type ? {type: data.type, status: true } : {status: true} ;
//   const result = yield StoreModel.find(filter);
//   this.body = {
//     success: true,
//     data: result,
//   }
// });
//
// // 搜索店铺
// router.post('/api/store/search', koaBody, function*(next){
//   const data = JSON.parse(this.request.body);
//   const result = data.type ? yield StoreModel.find({ $or: [
//     { keyWord: {'$regex': data.text , $options: '$i'} },
//     { storeName: {'$regex': data.text , $options: '$i'} },
//     { introduction: {'$regex': data.text , $options: '$i'} }
//   ], type: data.type , status: true }) : yield StoreModel.find({ $or: [
//     { keyWord: {'$regex': data.text , $options: '$i'} },
//     { storeName: {'$regex': data.text , $options: '$i'} },
//     { introduction: {'$regex': data.text , $options: '$i'} }
//   ] });
//   console.log(data, result);
//   this.body = {
//     success: true,
//     data: result,
//   }
// });

// // 创建菜品
// router.post('/api/menu/create', koaBody, function*(next) {
//   const data = JSON.parse(this.request.body);
//   AllMenuModel.create(data);
//   this.body = {
//     success: true,
//     data: data,
//   }
// });
//
// // 修改菜品
// router.post('/api/menu/update', koaBody, function*(next) {
//   const data = JSON.parse(this.request.body);
//   AllMenuModel.update({ id: data.id }, data, function(error){
//     console.log(error);
//   });
//   this.body = {
//     success: true,
//     data: data,
//   }
// });
//
// // 上传菜品图片
// router.post('/api/menuImg/upload', koaBody, function*(next) {
//   var part = this.request.body.files.uploadFile;
//   var fileName = part.name;
//   var tmpath = part.path;
//   var newpath = path.join('static/upload', Date.parse(new Date()).toString() + fileName);
//   var stream = fs.createWriteStream(newpath);//创建一个可写流
//   fs.createReadStream(tmpath).pipe(stream);//可读流通过管道写入可写流
//   this.body={
//     imgUrl: 'http://localhost:5000/show?' + newpath,
//   };
// });
//
// // 获取菜品信息
// router.post('/api/menu/show', koaBody, function*(next) {
//   const data = JSON.parse(this.request.body);
//   const result = yield AllMenuModel.findOne({ id: data.id });
//   this.body = {
//     success: true,
//     data: result,
//   }
// });
//
// // 根据类型选取菜品
// router.post('/api/menu/filter', koaBody, function*(next) {
//   const data = JSON.parse(this.request.body);
//   const obj = (data.type === '全部' || !data.type) ? { owner: data.owner } : { owner: data.owner, type: data.type };
//   const result = yield AllMenuModel.find(obj);
//   this.body = {
//     success: true,
//     data: result,
//   }
// });
//
// // 删除菜品
// router.post('/api/menu/delete', koaBody, function*(next) {
//   const data = JSON.parse(this.request.body);
//   const result = yield AllMenuModel.remove({ id: data.id }, function(err, result) {
//     console.log(err, result);
//   });
//   this.body = {
//     success: true,
//     data: result,
//   }
// });   //
//
//
// // 生成订单
// router.post('/api/order/create', koaBody, function*(next){
//   const data = JSON.parse(this.request.body);
//   OrderModel.create(data);
//   const num = (yield StoreModel.findOne({ owner: data.orderStore })).orderNum;
//   StoreModel.update({ owner: data.orderStore }, { orderNum: num + 1 }, function(error) {
//     console.log(error);
//   });
//   for (var i = 0; i < data.menuArr.length; i ++) {
//     let num = (yield AllMenuModel.findOne({ id: data.menuArr[i].id })).orderNum || 0;
//     num = num + data.menuArr[i].number;
//     AllMenuModel.update({ id: data.menuArr[i].id }, { orderNum: num }, function(error) {
//       console.log(error);
//     });
//   }
//   this.body = {
//     success: true,
//     data: data,
//   }
// });

// // 查询买家订单
// router.post('/api/buyer/order', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   const result = yield OrderModel.find({ userName: data.userName });
//   this.body = {
//     success: true,
//     data: result,
//   }
// });
//
// // 查询卖家订单
// router.post('/api/seller/order', koaBody, function*(){
//   const data = JSON.parse(this.request.body);
//   const result = yield OrderModel.find({ seller: data.owner });
//   this.body = {
//     success: true,
//     data: result,
//   }
// });
//
// // 更改订单状态
// router.post('/api/order/update', koaBody, function*(next) {
//   const data = JSON.parse(this.request.body);
//   OrderModel.update({ _id: data._id }, { status: data.status }, function(err){
//     console.log(err);
//   });
//   this.body = {
//     success: true,
//   }
// });
//
// // 查询订单
// router.post('/api/order/show', koaBody, function*(next) {
//   const data = JSON.parse(this.request.body);
//   const result = yield OrderModel.findOne({ _id: data._id });
//   this.body = {
//     success: true,
//     data: result,
//   }
// });

// // 评价
// router.post('/api/remark/create', koaBody, function*(next) {
//   const data = JSON.parse(this.request.body);
//   console.log(data);
//   RemarkModel.create(data);
//   const idArr = data.menuIdArr;
//   for (var i = 0; i < idArr.length; i ++) {
//     let num = (yield AllMenuModel.findOne({ id: idArr[i] })).score || 0;
//     num = num + data.score / 2;
//     AllMenuModel.update({ id: idArr[i] }, { score: num }, function(error) {
//       console.log(error);
//     });
//   }
//   const storeStar = (yield StoreModel.findOne({ owner: data.store })).star || 0;
//   StoreModel.update({ owner: data.store }, { star: (storeStar + data.score) / 2 }, function*(next) {
//     console.log(error);
//   });
//   this.body = {
//     success: true,
//   };
// });
//
// // 评价查询
// router.post('/api/remark/show', koaBody, function*(next){
//   const data = JSON.parse(this.request.body);
//   const result = yield RemarkModel.find({ store: data.owner });
//   this.body = {
//     success: true,
//     data: result,
//   }
// });
