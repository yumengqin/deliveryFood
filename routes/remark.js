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

// 评价
router.post('/remark/create', koaBody, function*(next) {
  const data = JSON.parse(this.request.body);
  console.log(data);
  RemarkModel.create(data);
  const idArr = data.menuIdArr;
  for (var i = 0; i < idArr.length; i ++) {
    let num = (yield AllMenuModel.findOne({ id: idArr[i] })).score || 0;
    num = num === 0 ? num : (num + data.score) / 2;
    AllMenuModel.update({ id: idArr[i] }, { score: num }, function(error) {
      console.log(error);
    });
  }
  const storeStar = (yield StoreModel.findOne({ owner: data.store })).star || 0;
  StoreModel.update({ owner: data.store }, { star: (storeStar === 0 ? storeStar ? (storeStar + data.score) / 2 }, function*(next) {
    console.log(error);
  });
  this.body = {
    success: true,
  };
});

// 评价查询
router.post('/remark/show', koaBody, function*(next){
  const data = JSON.parse(this.request.body);
  const result = yield RemarkModel.find({ store: data.owner });
  this.body = {
    success: true,
    data: result,
  }
});

module.exports = router;
