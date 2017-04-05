var db = require('./db').db;
//打开数据库
db.open();

exports.login = function () {
  db.createCollection('user',{safe:true},function(err,collection){
		//返回所有数据
		collection.find().toArray(function(err,docs){
			var obj={"docs":docs};
			//console.log(obj);
			var str=JSON.stringify(obj);
			console.log(str);
		});
	});
}
