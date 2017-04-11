import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
require('./index.less');

const FormItem = Form.Item;
const createForm = Form.create;

class LoginPage extends React.Component {
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) {
        console.log(err);
      }
      this.login(data);
    });
  }
  login (data) {
    fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        username : data.userName,
        password: data.password,
        remember: data.remember,
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      console.log(data);
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="login">
        <Form onSubmit={e => this.handleSubmit(e)} className="login-form">
            <h1>登录DeliveryFood</h1>
            <FormItem>
              {getFieldDecorator('userName', {
                rules: [
                  { required: true, message: '请输入用户名/手机号' },
                  { pattern: /^1(3|4|5|7|8)\d{9}$/, message: '请输入正确的手机号码'}
                ],
              })(
                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="手机号" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: '请输入密码' },
                  { pattern: /[0-9a-zA-Z]{6,20}/, message: '密码为6-20位数字或字母' },
                ],
              })(
                <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="密码" />
              )}
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
