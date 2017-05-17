import React, { PropTypes } from 'react';
import { Form, Button, Select, message, Spin, Input, Icon, Radio, Checkbox } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar'
import PicturesWall from '../../container/picturesWall'
import { toDate, toTime } from '../../utils/number'

require('./sellerSet.less');
require('./storeSet.less');

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

const plainOptions = [
  { label: '准时达', value: 'onTime' },
  { label: '外卖保', value: 'safe' },
  { label: '可开发票', value: 'invoice' },
];
class IndexPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state={
      fileList: [],
      data: '',
    };
  }
  componentWillMount() {
    this.getData();
    var map, geolocation;
  }
  setAdress() {
    var _this = this;
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
      const test = _this.state.data;
      test.adress = data.formattedAddress;
      test.latAndLon = [data.position.getLng(), data.position.getLat()];
       _this.setState({ data: test });
    }
    //解析定位错误信息
    function onError(data) {
       console.log(data);
    }
  }
  changeAdress(e) {
    const test = this.state.data;
    test.adress = e.target.value;
    test.latAndLon = [data.position.getLng(), data.position.getLat()];
    this.setState({ data: test });
  }
  getData() {
    const _this = this;
    fetch('/api/store', {
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
      });
      _this.setState({ data: res.data, fileList: res.data.album, option: res.data.option || []});
    })
  }
  handleSubmit(e){
    var _this = this;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!this.state.data.adress) {
        this.setState({ errorAdress: '请输入店铺地址或者点击图标进行定位'})
      }
      if (err) {
        console.log(err);
        return 0;
      }
      data.userName = this.state.data.owner;
      data.album = this.getAlbum(this.state.fileList);
      data.adress = this.state.data.adress;
      data.latAndLon = this.state.data.latAndLon;
      data.option = this.state.option,
      fetch('/api/store/update', {
        method: 'post',
        body: JSON.stringify(data),
        credentials: 'include'
      }).then(function(res) {
        return res.json();
      }).then(function(res) {
        if(res.success) {
          message.success('修改成功');
          _this.props.form.setFieldsValue({
            ...res.data,
          });
          _this.setState({ data: res.data, fileList: res.data.album });
        } else {
          message.error('修改失败');
        }
      })
    });
  }
  onChange(e) {
    this.setState({ option: e });
  }
  getAlbum(arr) {
    console.log(arr);
    const result = [];
    (arr || []).map(item => {
      if(item.url) {
        result.push(item.url);
      }
      else if (item.response){
        result.push(item.response.imgUrl);
      } else {
        result.push(item);
      }
    });
    return result;
  }
  render() {
    // console.log(this.state);
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="setSeller storeSet">
        <LeftBar />
        <div className="rightMenu">
        <h1>设置店铺信息 { this.state.data && this.state.data.storeName ? `（${this.state.data.storeName}）`: ''}</h1>
          <Form onSubmit={e => this.handleSubmit(e)}>
            <FormItem label="注册时间" className="justShow allRow">
              <Input readOnly value={this.state && this.state.data && toTime(this.state.data.startDate)}/>
            </FormItem>
            <FormItem label="店名">
              {getFieldDecorator('storeName', {
                rules: [
                  { required: true, message: '店名不能为空' },
                ],
              })(
                <Input prefix={<Icon type="inbox" style={{ fontSize: 16 }} />} />
              )}
            </FormItem>
            <FormItem label="店铺责任人">
              {getFieldDecorator('ownerName', {
                rules: [
                  { required: true, message: '不能为空' },
                ],
              })(
                <Input prefix={<Icon type="user" style={{ fontSize: 16 }} />} readOnly/>
              )}
            </FormItem>
            <FormItem label="店铺联系方式">
              {getFieldDecorator('phone', {
                rules: [
                  { required: true, message: '请输入电话号码' },
                ],
              })(
                <Input prefix={<Icon type="mobile" style={{ fontSize: 16 }} />} />
              )}
            </FormItem>
            <FormItem label="店铺地址" extra={this.state && this.state.errorAdress ? this.state.errorAdress : ''}>
              <Input
                value={this.state && this.state.data && this.state.data.adress ? this.state.data.adress : ''}
                prefix={<Icon type="environment-o" style={{ fontSize: 16 }} onClick={() => this.setAdress()}/>}
                onChange={e => this.changeAdress(e)}
              />
            </FormItem>
            <FormItem label="店铺类型">
              {getFieldDecorator('type', {})(
                <Select placeholder="请选择店铺类型">
                  <Option value="quick">快捷便当</Option>
                  <Option value="feature">特色菜系</Option>
                  <Option value="supper">小吃夜宵</Option>
                  <Option value="dessert">甜品饮品</Option>
                  <Option value="fruit">果蔬生鲜</Option>
                  <Option value="flower_cake">鲜花蛋糕</Option>
                  <Option value="market">商店超市</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="店铺关键字">
              {getFieldDecorator('keyWord', {
                rules: [],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="配送费">
              {getFieldDecorator('sendPrice', {
                rules: [
                  { required: true, message: '请输入配送费' },
                ],
              })(
                <Input prefix={<Icon type="pay-circle" />} />
              )}
            </FormItem>
            <FormItem label="选项（多选）">
              {getFieldDecorator('option', {
                rules: [],
              })(
                <CheckboxGroup options={plainOptions} defaultValue={this.state.option ? this.state.option : ''} onChange={e => this.onChange(e)} />
              )}
            </FormItem>
            <FormItem label="店铺简介">
              {getFieldDecorator('introduction', {
                rules: [],
              })(
                <Input type="textarea"/>
              )}
            </FormItem>
            <FormItem label="上传店铺照片墙" className="picturesWall">
              <PicturesWall app={this} fileList={this.state.fileList} />
            </FormItem>
            <FormItem className="saveBtn">
              <Button type="primary" htmlType="submit">保存</Button>
            </FormItem>
          </Form>
          </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  form: PropTypes.shape(),
};

export default createForm()(IndexPage);
