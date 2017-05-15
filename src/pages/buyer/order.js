import React from 'react';
import { Form, Button, DatePicker, message, Spin, Input, Icon, Radio } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar/buyerLeft'
import { toDate, toTime, toDecimal } from '../../utils/number'

require('./order.less');

class BuyerOrder extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state={
      data: '',
    };
  }
  componentWillMount() {
    this.getData();
  }
  getData() {
    const _this = this;
    fetch('/api/buyer/order', {
      method: 'post',
      body: JSON.stringify({
        userName : localStorage.getItem('userName'),
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ data: res.data });
    });
  }
  goStore(e, store) {
    hashHistory.push(`/store/${store}`);
  }
  sureFood(e, id) {
    const _this = this;
    fetch('/api/order/update', {
      method: 'post',
      body: JSON.stringify({
        _id: id,
        status: 'over'
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.getData();
      hashHistory.push(`/remark/${id}`);
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
                        (item.status === 'delivery' ? <strong style={{ cursor: 'pointer' }}>派送中<i onClick={e => this.sureFood(e, item._id)}>确认收货</i></strong> : '已完成')
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
