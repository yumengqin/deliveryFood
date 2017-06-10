import React, { PropTypes } from 'react';
import { Form, Button, DatePicker, message, Spin, Input, Icon, Radio } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { pluck, without } from 'underscore'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar/buyerLeft'
import { toDate, toTime, getDistance } from '../../utils/number'

require('./collection.less');

const FormItem = Form.Item;
const createForm = Form.create;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


class IndexPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      store: []
    }
  }
  componentWillMount() {
    this.getData();
    this.getAdress();
    if (localStorage.getItem('role') !== 'buyer') {
      hashHistory.push('/');
    }
  }
  getData() {
    const _this = this;
    fetch('/api/user', {
      method: 'post',
      body: JSON.stringify({
        userName : sessionStorage.getItem('userName'),
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.props.form.setFieldsValue({
        ...res.data,
        date: res.data.date && moment(toDate(res.data.date), 'YYYY-MM-DD'),
      });
      _this.setState({ data: res.data });
      _this.getCollect();
    });
  }
  getCollect() {
    const _this = this;
    fetch('/api/user/collect/show', {
      method: 'post',
      body: JSON.stringify({
        userName : sessionStorage.getItem('userName'),
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ store: res.data });
    });
  }
  getAdress() {
      var app = this;
      var map, geolocation;
      //加载地图，调用浏览器定位服务
      map = new AMap.Map('container', {
         resizeEnable: true
      });
      map.plugin('AMap.Geolocation', function() {
         geolocation = new AMap.Geolocation({
             enableHighAccuracy: true,//是否使用高精度定位，默认:true
             timeout: 10000,          //超过10秒后停止定位，默认：无穷大
             buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
             zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
             buttonPosition:'RB'
         });
         map.addControl(geolocation);
         geolocation.getCurrentPosition();
         AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
         AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
      });
      //解析定位结果
      function onComplete(data) {
        console.log('经度：' + data.position.getLng(), '纬度：' + data.position.getLat());
         app.setState({ adress: data.formattedAddress, latAndLon: [data.position.getLng(), data.position.getLat()] });
      }
      //解析定位错误信息
      function onError(data) {
         console.log(data);
      }
  }
  renderStore() {
    return (this.state.store || []).map((item, index) => {
      return (
        <li key={index}>
          <p className="cover">
            { item.album && item.album.length !== 0 ? <img src={item.album[0]} /> : '暂未上传图片'}
            <span>{item.storeName}</span>
          </p>
          { item.selfImg ? <img src={item.selfImg} className="selfImg" /> : <span className="selfImg">无</span>}
          <div className="content">
            <p className="content-item"><i>起送价</i><span>{item.sendPrice}</span></p>
            <p className="content-item"><i>送餐时间</i><span>{getDistance(this.state.latAndLon, item.latAndLon)}</span></p>
          </div>
          <div className="activity">
            { item.option && item.option.indexOf('onTime') ? <i className="activity-icon">准</i> : '' }
            { item.option && item.option.indexOf('safe') ? <i className="activity-icon">保</i> : '' }
            { item.option && item.option.indexOf('invoice') ? <i className="activity-icon">票</i> : '' }
            <i className="delete" onClick={e => this.delCollect(e, item.owner)}><Icon type="delete" /></i>
          </div>
        </li>
      );
    });
  }
  delCollect(e, owner) {
    const _this = this;
    const arr = pluck(this.state.store, 'owner');
    const res = without(arr, owner);
    fetch('/api/user/setCollect', {
      method: 'post',
      body: JSON.stringify({ userName: sessionStorage.getItem('userName'), collectArr: res }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      if (res.success) {
        _this.getData();
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="setSeller collection">
        <LeftBar />
        <div className="rightMenu">
          <h1>我的收藏</h1>
          <ul className="collectList">
            { this.state.store.length !== 0 ? this.renderStore() :
              <strong className="noStore">暂无收藏店铺</strong>
            }
          </ul>
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  form: PropTypes.shape(),
};

export default createForm()(IndexPage);
