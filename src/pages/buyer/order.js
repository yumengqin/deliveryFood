import React from 'react';
import io from 'socket.io-client'
import { Form, Button, DatePicker, message, Spin, Input, Icon, Radio } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar/buyerLeft'
import { toDate, toTime, toDecimal } from '../../utils/number'

const socket = io('http://localhost:5000');
require('./order.less');

class BuyerOrder extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state={
      data: '',
    };
  }
  componentWillMount() {
    if (sessionStorage.getItem('role') !== 'buyer') {
      hashHistory.push('/');
    }
    this.getData();
  }
  getData() {
    const _this = this;
    fetch('/api/buyer/order', {
      method: 'post',
      body: JSON.stringify({
        userName : sessionStorage.getItem('userName'),
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ data: res.data });
    }).then(() => {
      _this.interval();
    });
  }
  interval() {
    const _this = this;
    setInterval(function() {
      socket.emit('checkOrder', _this.state.data);
      socket.on('checkOrder', function(data) {
        if (data && data.length > 0) {
          data.map(item => {
            _this.sureFood('', item._id, item.status);
          });
        }
      });
    }, 5000);
  }
  goStore(e, store) {
    hashHistory.push(`/store/${store}`);
  }
  sureFood(e, id, status) {
    console.log('修改');
    const _this = this;
    fetch('/api/order/update', {
      method: 'post',
      body: JSON.stringify({
        _id: id,
        status: status
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.getData();
      if (status === 'over') {
        hashHistory.push(`/remark/${id}`);
      }
    });
  }
  render() {
    return(
      <div className="setSeller collection">
        <LeftBar />
        <div className="rightMenu order">
          <h1>我的订单</h1>
          <ul className="orderList">
            <li className="orderTitle">
              <span>下单时间</span>
              <span>订单内容</span>
              <span>支付金额（元）</span>
              <span>状态</span>
            </li>
            {
              (this.state.data || []).map((item, index) => {
                return (
                  <li key={index} className="orderItem">
                    <span>{toTime(item.createDate)}</span>
                    <span onClick={e => this.goStore(e, item.orderStore)}>
                      <img src={item.orderStoreImg} alt="暂无图片" title="商家图片" />
                      <p>
                        <strong>{item.orderStoreName}</strong>
                        {
                          (item.menuArr || []).map((val, i) => {
                            return (
                              <i key={i}>{val.menuName} {val.number}份</i>
                            );
                          })
                        }
                        <em>订单编号：{item._id}</em>
                      </p>
                    </span>
                    <span>{toDecimal(item.allPrice)}</span>
                    <span className={item.status === 'over' ? 'green' : 'red'}>
                      { item.status === 'place' ? '已提交订单' :
                        (item.status === 'delivery' ? <strong style={{ cursor: 'pointer' }}>派送中<i onClick={e => this.sureFood(e, item._id, 'over')}>确认收货</i></strong> :
                         (item.status === 'received' ? '商家已接单' : (item.status === 'outtime' ? '订单已失效' :  '已完成'))
                        )
                      }
                    </span>
                  </li>
                );
              })
            }
          </ul>
        </div>
      </div>
    );
  }
}

export default BuyerOrder;
