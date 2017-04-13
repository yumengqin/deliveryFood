var koa = require('koa');
var parse = require('co-body');
var db = require('./db').db;
//打开数据库
db.open();

exports.login = function (data, app) {
  db.createCollection('user',{safe:true},function(err,collection){
		//返回所有数据
		collection.find({ name: 'qinyumeng' }).toArray(function(err,docs){
			if (docs) {
        var obj={data:docs, success: true};
  			//console.log(obj);
  			app.body = JSON.stringify(obj);
      } else {
        var obj = {
          success: false,
          data: {
            errKey: 'user',
            errMsg: '该用户不存在',
          }};
        }
        app.body = JSON.stringify(obj);
		});
	});
}
