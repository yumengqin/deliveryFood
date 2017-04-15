// //引入数据库模块
// var mongodb=require('mongodb');
// //配置连接
// var mongodbserver=new mongodb.Server('127.0.0.1',27017,{auto_reconnect:true});
// //连接数据库
// exports.db=new mongodb.Db('test',mongodbserver,{safe:true});


var mongoose = require('mongoose');
var db       = mongoose.createConnection('mongodb://127.0.0.1:27017/test');
// 链接错误

exports.db = db;
