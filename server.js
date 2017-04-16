var koa = require('koa');
var parse = require('co-body');
var route = require('koa-route');
var views = require('co-views');
var webpack = require('webpack');
var koaBody = require('koa-body')();
var router  = require('koa-router')();
var webpackDev = require('koa-webpack-dev-middleware');
var webpackConf = require('./webpack.config.js');
var compiler = webpack(webpackConf);
var serve = require('koa-static');
var http = require('http');
var ccap = require('ccap')();
var app = new koa();


var db = require('./db/db').db;
var mongoose = require('mongoose');

var PersonSchema = require('./model/user').modleUser;


db.on('error', function(error) {
    console.log('连接失败', error);
});

db.on('open', function () {
  console.log('连接成功');
});

var PersonModel = db.model('user',PersonSchema);

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

// app.use(serve('./dist'));

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

router.post('/api/login', koaBody, function*() {
  var data = JSON.parse(this.request.body);
  if (data.checkCode.toLowerCase() === code.toLowerCase()) {
    const result = yield PersonModel.find({ userName: data.userName });
    if (result.length !== 0) {
      const pass = JSON.parse(JSON.stringify(result[0])).password;
      if (pass == data.password) {
        this.body = JSON.stringify({ success: true, data: result[0], remember: data.remember });
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
      PersonModel.create({name: data.name, userName: data.userName, password: data.password, role: 'buyer'});
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

router.get('/api/code', koaBody, function*() {
  var ary = ccap.get();
  var txt = ary[0];
  var buf = ary[1];
  code = txt;
  console.log(code);
  this.body = buf;
});

app.use(router.routes());

server.listen(process.env.PORT || 5000, function() {
  console.log('listening');
});

server.on('error', err => {
  console.log('error --> ', err.message);
  process.exit(1);
});
