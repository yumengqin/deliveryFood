import React, { PropTypes } from 'react';
import { hashHistory, Link, Input } from 'react-router'
import { Steps, Icon, message } from 'antd'
import Home from '../../components/header'

const Step = Steps.Step;

require('./order.less');

var inter = '';
class OrderPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state={
      order: [],
      data: '',
      user: '',
      mask: false,
    }
  }
  componentWillMount() {
    this.getStore();
    this.getOrder();
  }
  componentWillUnmount() {
    clearInterval(inter);
  }
  interval() {
    clearInterval(inter);
    const _this = this;
    inter = setInterval(function() {
      _this.getStore();
    }, 5000);
  }
  getOrder() {
    if (sessionStorage.getItem('cart'+this.props.params.id)){
      this.setState({ order: JSON.parse(sessionStorage.getItem('cart'+this.props.params.id)) });
    } else {
      hashHistory.push('/indexBuyer');
    }
  }
  getStore() {
    const _this = this;
    fetch('/api/store', {
      method: 'post',
      body: JSON.stringify({
        userName : _this.props.params.id,
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      if (!res.data.status) {
        _this.setState({ mask: true });
      } else {
        _this.setState({ data: res.data });
      }
      _this.interval();
    });
  }
  getAllPrice() {
    var price = this.state.data.sendPrice || 0;
    (this.state.order).map((item) => {
      price += item.number * (item.price + item.boxPrice);
    });
    return price;
  }
  changeNumber (e, val, type) {
    let number = val.number;
    const cart = JSON.parse(sessionStorage.getItem('cart'+this.props.params.id));
    let res = cart;
    if (type === 'add') {
      number ++;
    } else {
      number --;
    }
    cart.map((item, index) => {
      if (item.id === val.id) {
        if(number !== 0) {
          res[index].number = number;
        } else {
          res.splice(index, 1);
        }
        return 0;
      }
    });
    sessionStorage.setItem('cart'+this.props.params.id, JSON.stringify(res));
    this.getOrder();
  }
  change(e) {
    this.setState({ remark: e.target.value });
  }
  sureOrder() {
    const _this = this;
    var obj = {
      userName: sessionStorage.getItem('userName'),
      menuArr: JSON.parse(sessionStorage.getItem('cart'+this.props.params.id)),
      allPrice: this.getAllPrice(),
      remark: this.state.remark || '',
      createDate: new Date().getTime(),
      status: 'place',
      seller: this.props.params.id,
      orderStore: this.state.data.owner,
      orderStoreImg: this.state.data.selfImg,
      orderStoreName: this.state.data.storeName,
    };
    fetch('/api/order/create', {
      method: 'post',
      body: JSON.stringify(obj),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      if (res.success) {
        console.log(_this.state.data);
        message.success('下单成功');
        sessionStorage.removeItem('cart'+_this.state.data.owner);
        hashHistory.push('/buyer/order');
      }
    });
  }
  render() {
    console.log(this.state);
    return (
      <div>
        <div className={ this.state.mask ? 'maskWrapper' : 'maskWrapper none'}>
          <div className="maskBox">
            <p>店铺正在休息中</p>
            <Link to="/indexBuyer">点击返回</Link>
          </div>
        </div>
        <Home />
        <div className="order-head clear">
          <div style={{ width: '960px', margin: '0 auto'}}>
            <h1><span>DeliveryFood</span>|<span>订单信息</span></h1>
            <Steps current={1}>
              <Step title="选择商品" />
              <Step title="确认订单信息" />
              <Step title="成功提交订单" />
            </Steps>
          </div>
        </div>
        <div className="order-main clear">
          <div className="orderInfo">
            <div className="title">订单详情
              <Link to={`/store/${this.props.params.id}`}> <Icon type="arrow-left" />返回商家修改</Link>
            </div>
            <div className="orderTable">
              <table>
                <thead>
                  <tr><th>商品</th><th style={{ width: '100px' }}>份数</th><th>小计</th></tr>
                </thead>
                <tbody>
                  {
                    (this.state.order || []).map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.menuName}</td>
                          <td>
                            <div className='inputNumber'>
                              <span onClick={e => this.changeNumber(e, item, 'add')}>+</span>
                              <p>{item.number}</p>
                              <span onClick={e => this.changeNumber(e, item, 'sub')}>-</span>
                            </div>
                          </td>
                          <td>{item.number} * ({item.price} + {item.boxPrice}) = {item.number * (item.price + item.boxPrice)}元</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
            <div className="orderPrice">
              <p>配送费<Icon type="question-circle-o" /> <span>¥{this.state.data.sendPrice || 0}元</span></p>
              <p className="allPrie"><span>¥<i>{this.getAllPrice()}</i>元</span></p>
              <p><span>共{this.state.order.length}个商品</span></p>
            </div>
          </div>
          <div className="orderCheck">
            <h2>收货地址</h2>
            <p>
              <span>{JSON.parse(sessionStorage.getItem('adress')).connectUser || sessionStorage.getItem('name')}
                  &emsp;{JSON.parse(sessionStorage.getItem('adress')).connectPhone || sessionStorage.getItem('userName')}
              </span>
              <strong>{JSON.parse(sessionStorage.getItem('adress')).adress}</strong>
            </p>
            <h2>其他信息</h2>
            <p>
              <span>配送方式：本订单由蜂鸟专送提供配送</span>
              <span className="remark">备注信息：<input onChange={e => this.change(e)}/></span>
            </p>
            <button onClick={() => this.sureOrder()}>确认下单</button>
          </div>
        </div>
      </div>
    );
  }
}

OrderPage.propTypes = {
  form: PropTypes.shape(),
  params: PropTypes.shape(),
};

export default OrderPage;
