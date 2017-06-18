import React from 'react';
import { Form, Button, DatePicker, message, Spin, Input, Icon, Radio } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { findWhere } from 'underscore';
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar/buyerLeft'
import { toDate, toTime, toDecimal } from '../../utils/number'

require('./setRequest.less');
class BuyerOrder extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state={
      data: '',
      response: [],
    };
  }
  componentWillMount() {
    if (sessionStorage.getItem('role') !== 'buyer') {
      hashHistory.push('/');
    }
    this.getData();
    this.getStore();
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
      _this.setState({ data: res.data });
    });
  }
  getStore() {
    const _this = this;
    fetch('/api/store/search', {
      method: 'post',
      body: JSON.stringify({ text: '' }),
      credentials: 'include'
    }).then(function(res) {
      return res.json()
    }).then(function(res) {
      _this.setState({ store: res.data });
    })
  }
  setInputShow(i) {
    const item = this.state.response;
    item[i] = !item[i];
    this.setState({ response: item });
  }
  responseValue(e) {
    this.setState({ responseValue: e.target.value });
  }
  response(i, info, store) {
    const item = this.state.data.question;
    item.splice(i, 1);
    console.log(item);
    const _this = this;
    // /user/question/update
    fetch('/api/user/question/update', {
      method: 'post',
      body: JSON.stringify({
        owner: store,
        userName: sessionStorage.getItem('userName'),
        name: sessionStorage.getItem('name'),
        questInfo: info, // 问题的详细信息
        question: item, // 该用户的未答问题
        text: _this.state.responseValue
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      console.log(res);
      _this.getData();
    })
  }
  render() {
    return(
      <div className="setSeller collection">
        <LeftBar />
        <div className="rightMenu order">
          <h1>全部未回答问题</h1>
          <ul className="questionList">
            {
              (this.state.data && this.state.store && this.state.data.question || []).map((item, index) =>{
                const store = findWhere(this.state.store, { owner: item.askStore });
                if (!store) {
                  return '';
                }
                return (
                  <li key={index}>
                    <p>{ store.selfImg ? <img src={store.selfImg} /> : store.storeName}</p>
                    <p>来自用户{item.asker}的问题: <span>{item.askText}</span></p>
                    <p className={ this.state.response.length !== 0 && this.state.response[index] ? '' : 'none'}><Input onChange={e => this.responseValue(e)}/></p>
                    <p>
                      <Button className={this.state.response.length !== 0 && this.state.response[index] ? '' : 'none'} onClick={() => this.response(index, item, item.askStore)}>确认</Button>
                      <Button onClick={() => this.setInputShow(index)}>{ this.state.response.length !== 0 && this.state.response[index] ? '取消' : '回复'}</Button>
                    </p>
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
