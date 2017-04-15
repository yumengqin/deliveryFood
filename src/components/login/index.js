import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
require('./index.less');

const FormItem = Form.Item;
const createForm = Form.create;

class LoginPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state={
      url: `http://127.0.0.1:5000/api/code?${new Date().getTime()}`,
      codeExtra: '',
      userExtra: '',
      passExtra: '',
    }
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) {
        console.log(err);
      }
      this.login(data, this);
    });
  }
  url() {
    this.setState({ url: `http://127.0.0.1:5000/api/code?${new Date().getTime()}` });
  }
  login (data, app) {
    app.setState({ codeExtra: '', userExtra: '', passExtra: '' });
    fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        userName : data.userName,
        password: data.password,
        remember: data.remember,
        checkCode: data.checkCode,
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      if (!res.success) {
        if (res.data.errKey === 'code') {
          app.setState({ codeExtra: res.data.errMsg });
        } else if (res.data.errKey === 'user') {
          app.setState({ userExtra: res.data.errMsg });
        } else if (res.data.errKey === 'pass') {
          app.setState({ passExtra: res.data.errMsg });
        }
        app.url();
      } else {
        console.log(res);
      }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="login">
        <Form onSubmit={e => this.handleSubmit(e)} className="login-form">
            <h1>登录DeliveryFood</h1>
            <FormItem extra={this.state.userExtra}>
              {getFieldDecorator('userName', {
                rules: [
                  { required: true, message: '请输入用户名/手机号' },
                  { pattern: /^1(3|4|5|7|8)\d{9}$/, message: '请输入正确的手机号码'}
                ],
              })(
                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="手机号" />
              )}
            </FormItem>
            <FormItem extra={this.state.passExtra}>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: '请输入密码' },
                  { pattern: /[0-9a-zA-Z]{6,20}/, message: '密码为6-20位数字或字母' },
                ],
              })(
                <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="密码" />
              )}
            </FormItem>
            <FormItem extra={this.state.codeExtra}>
              {getFieldDecorator('checkCode', {
                rules: [{ required: true, message: '请输入验证码' }],
              })(
                <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="text" className="code-input" placeholder="验证码"/>
              )}
              <img src={this.state.url} className="code-img"/>
            </FormItem>
            <FormItem>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true,
              })(
                <Checkbox>记住密码</Checkbox>
              )}
              <a className="login-form-forgot" href="">忘记密码</a>
              <Button type="primary" htmlType="submit" className="login-form-button">
                登录
              </Button>
              <a href="">去注册</a>
            </FormItem>
        </Form>
      </div>
    );
  }
}

LoginPage.propTypes = {
  form: PropTypes.shape(),
};

export default connect()(createForm()(LoginPage))
