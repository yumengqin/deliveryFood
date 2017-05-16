import React, { PropTypes } from 'react';
import { hashHistory, Link } from 'react-router'
import { pluck } from 'underscore'
import { Steps, Icon, message, Rate, Input, Button } from 'antd'
import Home from '../../components/header'

require('./remark.less');

class RemarkPage extends React.Component{
  constructor(props, context) {
    super(props, context);
  }
  componentWillMount() {
    const _this = this;
    fetch('/api/order/show', {
      method: 'post',
      body: JSON.stringify({
        _id: this.props.params.id,
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      console.log(pluck(res.data.menuArr, 'id'));
      _this.setState({ data: res.data, idArr: pluck(res.data.menuArr, 'id'), store: res.data.orderStore });
    });
  }
  goReturn() {
    hashHistory.push('/buyer/order');
  }
  rate(e) {
    this.setState({ rate: e });
  }
  onChange(e) {
    this.setState({ val: e.target.value });
  }
  sureSubmit() {
    fetch('/api/remark/create', {
      method: 'post',
      body: JSON.stringify({
        menuIdArr: this.state.idArr,
        score: this.state.rate,
        userName: localStorage.getItem('userName'),
        store: this.state.store,
        createDate: new Date().getTime(),
        text: this.state.val,
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      if (res.success) {
        message.success('提交成功');
        hashHistory.push('/indexBuyer');
      } else {
        message.error('提交失败');
      }
    });
  }
  render() {
    return (
      <div>
        <Home />
        <div className="rate">
          <h2>请评价</h2>
          <div className="item clear">
            <span>评分：</span><Rate defaultValue={0} onChange={e => this.rate(e)}/>
          </div>
          <div className="item clear">
            <span>请填写评价</span>
            <Input type="textarea" rows={6} onChange={e => this.onChange(e)}/>
          </div>
          <Button type="primary" onClick={() => this.sureSubmit()}>提交</Button>
          <Button type="default" onClick={() => this.goReturn()}>返回</Button>
        </div>
      </div>
    );
  }
}

RemarkPage.propTypes = {
  form: PropTypes.shape(),
  params: PropTypes.shape(),
};

export default RemarkPage;
