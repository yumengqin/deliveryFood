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
var app = new koa();

var login = require('./db/login').login;

// //引入数据库模块
// var mongodb=require('mongodb');
// //配置连接
// var mongodbserver=new mongodb.Server('127.0.0.1',27017,{auto_reconnect:true});
// //连接数据库
// var db=new mongodb.Db('test',mongodbserver,{safe:true});
// //打开数据库
// db.open();

var render = views('./src', {
  ext: 'ejs'
});

var server = require('http').Server(app.callback());
var io = require('socket.io')(server);

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
  socket.on('msg from client', function(data) {
    if (!cache.nameListActive.has(data.nickName)) {
      socket.emit('self logout');
    } else {
      socket.broadcast.emit('msg from server', data);
      cache.msgList.push(data);
      if (cache.msgList.length >= 100) {
        cache.msgList.shift();
      }
    }
  });
  socket.on('disconnect', function() {
    cache.nameListActive.delete(socket.nickname);
    io.emit('guest update',
      [...cache.nameListActive]
    );
  });
  socket.on('guest come', function(data) {
    cache.nameListActive.add(data);
    cache.nameList[data] = 7200000;
    socket.nickname = data;
    io.emit('guest update',
      [...cache.nameListActive]
    );
  });
  socket.on('guest leave', function(data) {
    cache.nameListActive.delete(data);
    delete cache.nameList[data];
    socket.nickname = undefined;
    io.emit('guest update',
      [...cache.nameListActive]
    );
  });
  socket.on('heart beat', function() {
    if (socket.nickname != undefined) {
      cache.nameList[socket.nickname] = 7200000;
    }
  });
});

app.use(webpackDev(compiler, {
  contentBase: webpackConf.output.path,
  publicPath: webpackConf.output.publicPath,
  hot: false
}));

// app.use(serve('./dist'));

app.use(route.get('/', function*() {
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
  console.log(this.request.body);
  // db.createCollection('user',{safe:true},function(err,collection){
	// 	//返回所有数据
	// 	collection.find().toArray(function(err,docs){
	// 		var obj={"docs":docs};
	// 		//console.log(obj);
	// 		var str=JSON.stringify(obj);
	// 		console.log(str);
	// 	});
	// });
	login()
  this.body = JSON.stringify({
    lalal: '111',
    nickname: 'qin'
  });
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

app.use(router.routes());

server.listen(process.env.PORT || 5000, function() {
  console.log('listening');
});

server.on('error', err => {
  console.log('error --> ', err.message);
  process.exit(1);
});
