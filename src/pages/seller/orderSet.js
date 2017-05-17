import React from 'react';
import { Form, Button, DatePicker, message, Spin, Input, Icon, Radio } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar/index'
import { toDate, toTime, toDecimal } from '../../utils/number'

require('./orderSet.less');

class SellerOrder extends React.Component {
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
    fetch('/api/seller/order', {
      method: 'post',
      body: JSON.stringify({
        owner : sessionStorage.getItem('userName'),
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ data: res.data });
    });
  }
  sureFood(e, id) {
    const _this = this;
    fetch('/api/order/update', {
      method: 'post',
      body: JSON.stringify({
        _id: id,
        status: 'delivery',
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.getData();
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
                      {item.status === 'over' ? '已完成' :
                        (item.status === 'place' ? <strong><span onClick={e => this.sureFood(e, item._id)} style={{ cursor: 'pointer' }}>设置送出</span></strong> : '派送中')
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

export default SellerOrder;