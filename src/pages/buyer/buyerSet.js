import React, { PropTypes } from 'react';
import { Form, Button, DatePicker, message, Spin, Input, Icon, Radio } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar/buyerLeft'
import { toDate, toTime } from '../../utils/number'

require('./buyerSet.less');

const FormItem = Form.Item;
const createForm = Form.create;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


class IndexPage extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  componentWillMount() {
    this.getData();
  }
  getData() {
    const _this = this;
    fetch('/api/user', {
      method: 'post',
      body: JSON.stringify({
        userName : localStorage.getItem('userName'),
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
    })
  }
  handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) {
        console.log(err);
        return 0;
      }
      var _this = this;
      data.lastLogin = this.state.data.lastLogin;
      data.startDate = this.state.data.startDate;
      data.date = toDate(data.date);
      fetch('/api/user/update', {
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
            date: res.data.date && moment(toDate(res.data.date), 'YYYY-MM-DD'),
          });
          _this.setState({ data: res.data });
        } else {
          message.error('修改失败');
        }
      })
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="setSeller">
        <LeftBar />
        <h1>修改个人信息</h1>
        <Form onSubmit={e => this.handleSubmit(e)}>
          <FormItem label="手机号">
            {getFieldDecorator('userName', {
              rules: [
                { required: true, message: '请输入用户名/手机号' },
                { pattern: /^1(3|4|5|7|8)\d{9}$/, message: '请输入正确的手机号码'}
              ],
            })(
              <Input prefix={<Icon type="mobile" style={{ fontSize: 16 }} />} readOnly/>
            )}
          </FormItem>
          <FormItem label="姓名">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入姓名' },
              ],
            })(
              <Input prefix={<Icon type="user" style={{ fontSize: 16 }} />} />
            )}
          </FormItem>
          <FormItem label="出生日期">
            {getFieldDecorator('date', {
              rules: [
                { required: true, message: '请输入出生日期' },
              ],
            })(
              <DatePicker />
            )}
          </FormItem>
          <FormItem label="爱好">
            {getFieldDecorator('like', {
              rules: [],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="性别" className="allRow">
            {getFieldDecorator('sex')(
              <RadioGroup>
                <Radio value="男">男</Radio>
                <Radio value="女">女</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <span className="line"></span>
          <FormItem label="注册时间" className="justShow">
            <Input readOnly value={this.state && this.state.data && toTime(this.state.data.startDate)}/>
          </FormItem>
          <FormItem label="上次登录时间" className="justShow">
            <Input readOnly value={this.state && this.state.data && toTime(this.state.data.lastLogin)}/>
          </FormItem>
          <span className="line"></span>
          <FormItem className="saveBtn">
            <Button type="primary" htmlType="submit">保存</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

IndexPage.propTypes = {
  form: PropTypes.shape(),
};

export default createForm()(IndexPage);
